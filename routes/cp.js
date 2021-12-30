const express = require("express");
const authUser = require("../middleware/authUser");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

function copyFile(sourceFile, destDirectory, newCopiedFilePath) {
  const copiedFile = sourceFile.clone(newCopiedFilePath);
  destDirectory.content.push(copiedFile);
  return copiedFile;
} 

function validateReq(req, res) {
  if (!req.body.params || req.body.params.length < 1)
  return res.status(401).send("Access denied, no filePath provided.");

  if (req.body.params === 1)
    return res.status(400).send(`cp: missing destination file operand after ${req.body.params[0]}`);
}

function findFile(user, filePath, res, throwError=true) {
  const foundFile = user.findFile(filePath).file;
  if (!foundFile && throwError)
    return res
      .status(400)
      .send(`cp: cannot create regular file '${filePath}': No such file or directory`);

  return foundFile;
}

function CopySrcFileToDest(user, sourceFile, destFilePath, fileNamePattern, res) {
  let destinationDirectory;
  const fileNamePart = destFilePath.match(new RegExp(`^${fileNamePattern}`))
  if (!fileNamePart) {
    const destDirPath = destFilePath.replace(new RegExp(fileNamePattern), "");
    destinationDirectory = findFile(user, destDirPath, res);
    
    fileName = sourceFile.name;
  }
  else {
    fileName = fileNamePart[0];
    destinationDirectory = user.currentFile;
  }
  
  const copiedFile = copyFile(sourceFile, destinationDirectory, `${destinationDirectory.path}/${fileName}`);
  res.send(copiedFile);
}

function copyMultipleSourcesToDest(user, res, destDirectoryPath, sourcesPaths) {
  console.log("sourcesPaths = ", sourcesPaths)
  const destDirectory = findFile(user, destDirectoryPath, res);
  const allCopiedFiles = [];
  if (destDirectory.type !== envConstants.types.d)
    return res
    .status(404)
    .send(`cp: target '${destDirectoryPath}' is not a directory`);
  
  for (sourcePath of sourcesPaths) {
    let foundFile = findFile(user, sourcePath, res, false);
    if (!foundFile) {
      console.log(`cp: cannot stat ${sourcePath}: No such file or directory`);
      continue;
    }

    const copiedFile = copyFile(foundFile, destDirectory, `${destDirectory.path}/${foundFile.name}`);
    allCopiedFiles.push(copiedFile);
  }

  res.send(allCopiedFiles);
}

router.post("/:userName", authUser, (req, res) => {
  const { user } = req.user;
  const lastItemIndex = req.body.params.length - 1;
  const fileNamePattern = "\\w+(?:\\.\\w+)*?$";

  validateReq(req, res);

  const sourceFile = req.body.params[0];
  const destFilePath  = req.body.params[lastItemIndex];
  const sourceFileSearchResult = user.findFile(sourceFile).file;

  if (!sourceFileSearchResult)
    console.log(`cp: cannot stat ${sourceFile}: No such file or directory`)

  if (req.body.params.length === 2) {
    CopySrcFileToDest(user, sourceFileSearchResult, destFilePath, fileNamePattern, res)
  }

  copyMultipleSourcesToDest(user, res, destFilePath, req.body.params.slice(0, lastItemIndex));

});

module.exports = router;
