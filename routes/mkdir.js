const express = require("express");
const { File } = require("../resources/file");
const users = require("../startups/users").users;
const { extractPathParameters } = require("../resources/paths");
const authUser = require("../middleware/authUser");
const envConstants = require("../configs/envConstants.json");
const baseDirs = require("../configs/baseDirs.json");

const router = express.Router();

function displayErrorMessage(errorMsg, resultList) {
  console.log(errorMsg);
  resultList.push(errorMsg);
}

function addNewDirectory(newDirectoryPath, newDirectoryName, newDirectoriesList, parentDirectory) {
  let newDirectory = new File(newDirectoryPath, null, envConstants.types.d, newDirectoryName);
  newDirectoriesList.push(newDirectory.path);
  parentDirectory.content.push(newDirectory);
  console.log("users", JSON.stringify(users));
}

router.post("/:userName", authUser, (req, res) => {
  let containingDir, newDirectoryPath, allNewDirectories = [];
  const { user } = req.user;
  
  for (currentFilePath of req.body.params) {
    const { filePath, FilePathWithFileName } = extractPathParameters(currentFilePath);
    if (currentFilePath.startsWith(baseDirs.rootPath)) {
      if (user.findFile(FilePathWithFileName)) {
        displayErrorMessage(`mkdir: cannot create directory ${FilePathWithFileName}: File exists`, allNewDirectories);
        continue;
      }
      
      dirSearchResult = user.findFile(filePath);
      if (!dirSearchResult) {
        displayErrorMessage(`mkdir: cannot create directory '${filePath}': No such file or directory`, allNewDirectories);
        continue;
      }

      containingDir = dirSearchResult.file;
      newDirectoryPath = FilePathWithFileName;
    }

    else {
      containingDir = user.currentFile;
      newDirectoryPath = `${containingDir.path}/${currentFilePath}`;
    }
  
    addNewDirectory(newDirectoryPath, req.params["userName"], allNewDirectories, containingDir);
  }

  res.send(JSON.stringify(allNewDirectories));
});

module.exports = router;
