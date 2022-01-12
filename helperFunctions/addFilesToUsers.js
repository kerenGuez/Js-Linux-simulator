const { File } = require("../resources/file");
const baseDirs = require("../configs/baseDirs.json");
const envConstants = require("../configs/envConstants.json");
const { extractPathParameters } = require("../resources/paths");


function displayErrorMessage(errorMsg, resultList) {
    console.log(errorMsg);
    resultList.push(errorMsg);
}

function removeExisting(existingFile) {
  const containingDir = existingFile.containingDirectory.content;
  containingDir.splice(existingFile.index, 1); 
}

function addNewFile(newPath, fileOwner, addedFilesAndDirsList, parentDirectory, type, content=null) {
    let newDirectory = new File(newPath, content, type, fileOwner);
    addedFilesAndDirsList.push(newDirectory.path);
    parentDirectory.content.push(newDirectory);
}

function handleFileAlreadyExists(user, filePath, shouldAcceptExistingFile, commandName, allNewFiles, fileType, content, shouldOverride, shouldAppend) {
  const fullPathSearchResult = user.findFile(filePath, fileType);
  if (fullPathSearchResult) {
    if (shouldAppend) {
      fullPathSearchResult.file.content += '\n' + content;
      allNewFiles.push(filePath);
      return false;
    }

    if (shouldOverride) {
      removeExisting(fullPathSearchResult);
      return true;
    }

    if (!shouldAcceptExistingFile) 
        displayErrorMessage(`${commandName}: cannot create directory ${filePath}: File exists`, allNewFiles);
      return false; 
  }
  return true;  
}

function getContainingDirAndNewPath(user, currentFilePath, commandName, allNewFiles) {
  const { filePath, FilePathWithFileName } = extractPathParameters(currentFilePath);

  if (currentFilePath.startsWith(baseDirs.rootPath)) {   
    let containingDirSearchResult = user.findFile(filePath, envConstants.types.d);
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

function addNewFilesOrDirs(owner, user, pathsToNewFiles, shouldAcceptExistingFile, commandName, type, content=null, shouldOverride=false, shouldAppend=false) {
    let allNewFiles = [];
    
    for (currentFilePath of pathsToNewFiles) {
      const shouldContinue = handleFileAlreadyExists(user, currentFilePath, shouldAcceptExistingFile,
         commandName, allNewFiles, type, content, shouldOverride, shouldAppend);
      if (!shouldContinue)
        continue;
    
      const result = getContainingDirAndNewPath(user, currentFilePath,
         shouldAcceptExistingFile, commandName, allNewFiles, type, shouldOverride);
      
      if (result)
        addNewFile(result.newPath, owner, allNewFiles, result.containingDir, type, content);
    }
    return allNewFiles;
}

module.exports = addNewFilesOrDirs;
