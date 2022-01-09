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

function addNewFilesOrDirs(owner, user, pathsToNewFiles, shouldAcceptExistingFile, commandName, type) {
    let containingDir, newPath, allNewFiles = [];
    
    for (currentFilePath of pathsToNewFiles) {
      const { filePath, FilePathWithFileName } = extractPathParameters(currentFilePath);
      if (currentFilePath.startsWith(baseDirs.rootPath)) {
        if (user.findFile(FilePathWithFileName)) {
          if (!shouldAcceptExistingFile) 
            displayErrorMessage(`${commandName}: cannot create directory ${FilePathWithFileName}: File exists`, allNewFiles);
  
          continue;  
        }
        
        let searchResult = user.findFile(filePath);
        if (!searchResult) {
          displayErrorMessage(`${commandName}: cannot create directory '${filePath}': No such file or directory`, allNewFiles);
          continue;
        }
  
        containingDir = searchResult.file;
        newPath = FilePathWithFileName;
      }
      else {
        containingDir = user.currentFile;
        newPath = `${containingDir.path}/${currentFilePath}`;
      }
      addNewFile(newPath, owner, allNewFiles, containingDir, type);
    }
    return allNewFiles;
}

module.exports = addNewFilesOrDirs;
