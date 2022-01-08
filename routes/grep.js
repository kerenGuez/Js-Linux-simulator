const express = require("express");
const authUser = require("../middleware/authUser");
const authTheFile = require("../middleware/abstractAuthFile");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

function escapeRegex(string) {
    return string.replace(/[\/\\*+?()|\{}]/g, '\\$&');
}

// Return an array of arrays of the starting and ending index of each pattern match in the given string.
function getMatches(string, patternToSearch) {
    let regex = new RegExp(patternToSearch, 'g');
    let result = [];

    while ((match = regex.exec(string)) != null)
        result.push([match.index, match.index + match[0].length]);
    
    return result;
}

// Return a new string colored in the given position ranges.
// "\033[0m" = regular white color
// "\033[31m" = red color
function colorMatches(stringToColor, matchPositions) {
    let start = 0;
    let newString = "";
  
    for (positionRange of matchPositions) {
      let [matchStartIndex, matchEndIndex] = positionRange;
      newString += "\033[0m" + stringToColor.slice(start, matchStartIndex) 
      + "\033[31m" + stringToColor.slice(matchStartIndex, matchEndIndex);
      start = matchEndIndex;
    }

    return newString + "\033[0m" + stringToColor.slice(start);
  }

function basicGrep(text, wordToSearch) {
    const textLines = text.split('\n');
    let grepResult = "";
    for (line of textLines) {
        let escapedPattern = escapeRegex(wordToSearch);
        let matchesPositions = getMatches(line, escapedPattern);
        if (matchesPositions.length)
            grepResult += colorMatches(line, matchesPositions) + "\n";
    }
    return grepResult.replace(/\n$/g, "");
}

// const string = `hello
// hello mate
// did you here it?
// hear my hello?`
// console.log(basicGrep(string, "hello"));

router.post("/:userName", authUser, (req, res) => {
  let content = "";
  let stdin = req.body.stdin;
  let [pattern, ...files] = req.body.params;
  const allFiles = authTheFile(req.user, files, res, stdin);
  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].type == envConstants.types.d)
      content += `grep: ${allFiles[i].path}: Is a directory\n`;
    
    else if (allFiles.length === 1)
        content += basicGrep(allFiles[i].content, pattern) + '\n';
    
    else {
        content += `${req.body.params[i + 1]}:` + basicGrep(allFiles[i].content, pattern) + '\n';
    }
  }

  content = content.replace(/\n$/g, "");

  console.log("grep:", content);
  res.send(content);
});

module.exports = router;
