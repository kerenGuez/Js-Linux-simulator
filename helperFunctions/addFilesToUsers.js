const { File } = require("../resources/file");
const baseDirs = require("../configs/baseDirs.json");
const { extractPathParameters } = require("../resources/paths");


function displayErrorMessage(errorMsg, resultList) {
    console.log(errorMsg);
    resultList.push(errorMsg);
}

function addNewFile(newPath, fileOwner, addedFilesAndDirsList, parentDirectory, type) {
    let newDirectory = new File(newPath, null, type, fileOwner);
    addedFilesAndDirsList.push(newDirectory.path);
    parentDirectory.content.push(newDirectory);
}

function getContainingDirAndNewPath(user, currentFilePath, shouldAcceptExistingFile, commandName, allNewFiles, fileType) {
  const { filePath, FilePathWithFileName } = extractPathParameters(currentFilePath);

  if (currentFilePath.startsWith(baseDirs.rootPath)) {
    const fullPathSearchResult = user.findFile(FilePathWithFileName, fileType);
    if (fullPathSearchResult) {
      if (!shouldAcceptExistingFile) 
        displayErrorMessage(`${commandName}: cannot create directory ${FilePathWithFileName}: File exists`, allNewFiles);
      return;  
    }
    
    let containingDirSearchResult = user.findFile(filePath);
    if (!containingDirSearchResult) {
      displayErrorMessage(`${commandName}: cannot create directory '${filePath}': No such file or directory`, allNewFiles);
      return;
    }

    return {
      containingDir: containingDirSearchResult.file,
      newPath: FilePathWithFileName,
    }
  }

  return {
    containingDir: user.currentFile,
    newPath: `${containingDir.path}/${currentFilePath}`
  }
}

function addNewFilesOrDirs(owner, user, pathsToNewFiles, shouldAcceptExistingFile, commandName, type) {
    let allNewFiles = [];
    
    for (currentFilePath of pathsToNewFiles) {
      const result = getContainingDirAndNewPath(user, currentFilePath,
         shouldAcceptExistingFile, commandName, allNewFiles, type);
      
      if (result)
        addNewFile(result.newPath, owner, allNewFiles, result.containingDir, type);
    }
    return allNewFiles;
}

module.exports = addNewFilesOrDirs;
