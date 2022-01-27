const express = require("express");
const authUser = require("../middleware/authUser");
const authTheFile = require("../middleware/abstractAuthFile");
const environmentVariables = require("../configs/environmentVariables.json");
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
// Makes an error in tests using jest because strict mode doesn't recognize the color codes
function colorMatches(stringToColor, matchPositions, flags=null) {
    let start = 0;
    let newString = "";
    flags = flags || {};
    for (positionRange of matchPositions) {
      let [matchStartIndex, matchEndIndex] = positionRange;
      const coloredMatchedPart = "\033[31m" + stringToColor.slice(matchStartIndex, matchEndIndex);
      if (flags.o) {
        newString += coloredMatchedPart + '\n';
      }

      else
        newString += "\033[0m" + stringToColor.slice(start, matchStartIndex) + coloredMatchedPart;
      start = matchEndIndex;
    }

    if (flags.o) {
      return newString + "\033[0m";
    }

    return newString + "\033[0m" + stringToColor.slice(start) + '\n';
}

function colorBackToDefault(text) {
  return text.replace("\033[0m", "")
  .replace("\033[31m", "");
}

function basicGrep(text, wordToSearch, flags) {
    text = colorBackToDefault(text);
    const textLines = text.split('\n');
    let grepResult = "";
    for (line of textLines) {
        let escapedPattern = escapeRegex(wordToSearch);
        let matchesPositions = getMatches(line, escapedPattern);
        if (matchesPositions.length) 
            grepResult += colorMatches(line, matchesPositions, flags);   
    }
    
    return grepResult.replace(/(\n)+$/g, "");
}

// const string = `hello
// hello mate hello!
// did you here it?
// hear my hello?
// hello
// `
// console.log(basicGrep(string, "hello", {'o': true}));

router.post("/:userName", authUser, (req, res) => {
  const errors = [];
  let content = "";
  let stdin = req.body.stdin;
  let [pattern, ...files] = req.body.params;
  let flags = req.body.flags || {};
  const allFiles = authTheFile(req.user, files, res, stdin);
  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].type == envConstants.types.d) {
      let errorMsg = `grep: ${allFiles[i].path}: Is a directory\n`;
      errors.push(errorMsg);
      content += errorMsg;
    }
    
    else if (allFiles.length === 1)
        content += basicGrep(allFiles[i].content, pattern, flags) + '\n';
    
    else {
        content += `${req.body.params[i + 1]}:` + basicGrep(allFiles[i].content, pattern, flags) + '\n';
    }
  }

  content = content.replace(/\n$/g, "");
  if (!content) {
    errors.push('');
  }

  environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
  console.log("grep:", content);
  res.send(content);
});

module.exports = router;
