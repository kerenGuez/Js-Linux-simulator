const express = require("express");
const users = require("../startups/users").users;
const authUser = require("../middleware/authUser");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

function copyFile(sourceFile, destDirectory, newCopiedFilePath) {
  const copiedFile = sourceFile.clone(newCopiedFilePath);
  destDirectory.content.push(copiedFile);
  return copiedFile;
} 

function validateReq(req, res, commandName) {
  if (!req.body.params || req.body.params.length < 1)
    return res.status(401).send("Access denied, no filePath provided.");

  if (req.body.params === 1)
    return res.status(400).send(`${commandName}: missing destination file operand after ${req.body.params[0]}`);
}

function findFile(user, filePath, res, commandName, throwError=true) {
  const foundFile = user.findFile(filePath).file;
  if (!foundFile && throwError)
    return res
      .status(400)
      .send(`${commandName}: cannot create regular file '${filePath}': No such file or directory`);

  return foundFile;
}

function CopySrcFileToDest(user, sourceFile, destFilePath, res, commandName) {
  let destinationDirectory;
  const fileNamePattern = "\\w+(?:\\.\\w+)*?$";

  const fileNamePart = destFilePath.match(new RegExp(`^${fileNamePattern}`))
  if (!fileNamePart) {
    // const destDirPath = destFilePath.replace(new RegExp(fileNamePattern), "");
    const destDirPath = destFilePath;
    destinationDirectory = findFile(user, destDirPath, res, commandName);
    
    fileName = sourceFile.name;
  }
  else {
    fileName = fileNamePart[0];
    destinationDirectory = user.currentFile;
  }
  
  const copiedFile = copyFile(sourceFile, destinationDirectory, `${destinationDirectory.path}/${fileName}`);
  return copiedFile;
}

function copyMultipleSourcesToDest(user, res, destDirectoryPath, sourcesPaths, commandName) {
  const destDirectory = findFile(user, destDirectoryPath, res, commandName);
  const allCopiedFiles = [];
  if (destDirectory.type !== envConstants.types.d)
    return res
    .status(404)
    .send(`${commandName}: target '${destDirectoryPath}' is not a directory`);
  
  for (sourcePath of sourcesPaths) {
    let foundFile = findFile(user, sourcePath, res, commandName, false);
    if (!foundFile) {
      console.log(`${commandName}: cannot stat ${sourcePath}: No such file or directory`);
      continue;
    }

    const copiedFile = copyFile(foundFile, destDirectory, `${destDirectory.path}/${foundFile.name}`);
    allCopiedFiles.push(copiedFile);
  }

  return allCopiedFiles;
}

function copyAndOrRemove(user, filePaths, res, commandName) {
  let allCopiedFiles;
  const lastFileIndex = filePaths.length - 1;

  const sourceFile = filePaths[0];
  const destFilePath  = filePaths[lastFileIndex];
  const sourceFileSearchResult = user.findFile(sourceFile).file;

  if (!sourceFileSearchResult)
    console.log(`${commandName}: cannot stat ${sourceFile}: No such file or directory`)

  if (filePaths.length === 2) {
    allCopiedFiles = CopySrcFileToDest(user, sourceFileSearchResult, destFilePath, res)
  }
  else {
    allCopiedFiles = copyMultipleSourcesToDest(user, res, destFilePath, filePaths.slice(0, lastFileIndex), commandName);
  }
  return allCopiedFiles;

}

router.post("/:userName", authUser, (req, res) => {
  const commandName = 'cp';
  validateReq(req, res, commandName);
  const { user } = req.user;
  let allCopiedFiles = copyAndOrRemove(user, req.body.params, res, commandName);

  console.log("users", JSON.stringify(users[0]));
  console.log(allCopiedFiles);
  res.send(allCopiedFiles);
});

module.exports = router;
