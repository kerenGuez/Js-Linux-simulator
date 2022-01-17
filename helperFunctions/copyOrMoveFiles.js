const envConstants = require("../configs/envConstants.json");
const { extractPathParameters } = require("../resources/paths");
const environmentVariables = require("../configs/environmentVariables.json");

function copyFile(sourceFile, destDirectory, newCopiedFilePath, shouldRemoveSrcFile=false) {
    const copiedFile = sourceFile.file.clone(newCopiedFilePath);
    destDirectory.content.push(copiedFile);
    if (shouldRemoveSrcFile) {
      console.log(sourceFile.containingDirectory);
      sourceFile.containingDirectory.content.splice(sourceFile.index, 1);
    }
  
    return copiedFile;
} 

function validateReq(req, res, commandName) {
    if (!req.body.params || req.body.params.length < 1)
      return res.status(401).send("Access denied, no filePath provided.");
  
    if (req.body.params === 1) {
      const errorMsg = `${commandName}: missing destination file operand after ${req.body.params[0]}`;
      handleErrors(errorMsg, errors);
      return res.send(errorMsg);
    }
}

function findFile(user, filePath, res, commandName, fileType, throwError=true) {
    const foundFile = user.findFile(filePath, fileType);
    if (!foundFile && throwError){
      const errorMsg = `${commandName}: cannot create regular file '${filePath}': No such file or directory`;
      handleErrors(errorMsg, errors);
      return res.send(errorMsg);
    }
  
    return foundFile;
}

// If a file with the same name already exists in the directory, remove it.
function removeExisting(user, pathToSearch, fileType) {
  const searchResult = user.findFile(pathToSearch, fileType);
  if (searchResult) {
    const containingDir = searchResult.containingDirectory.content;
    containingDir.splice(searchResult.index, 1);
  }
}

function CopySrcFileToDest(user, sourceFile, destFilePath, res, commandName, shouldRemoveSrcFile=false) {
    let destinationDirectory, nameOfCopiedFile;
    // file name pattern e.g: 'file.txt' (accepts words possibly followed by suffix)
    const { filePath, allPathComponents, fileName } = extractPathParameters(destFilePath);
    const destFileSearchResult = user.findFile(destFilePath, envConstants.types.d).file;

    if (destFileSearchResult) {
      destinationDirectory = destFileSearchResult;
      nameOfCopiedFile = sourceFile.file.name;
    }

    else {
      if (allPathComponents.length === 1)
        destinationDirectory = user.currentFile;
      
      else 
         destinationDirectory = findFile(user, filePath, res, commandName, envConstants.types.d).file;
      
      nameOfCopiedFile = fileName;
    }
    
    const newPath = `${destinationDirectory.path}/${nameOfCopiedFile}`;
    removeExisting(user, newPath, envConstants.types.f);
    const copiedFile = copyFile(sourceFile, destinationDirectory, newPath, shouldRemoveSrcFile);
    return copiedFile;
}

function copyMultipleSourcesToDest(user, res, destDirectoryPath, sourcesPaths, commandName, shouldRemoveSrcFile=false) {
    const destDirectory = findFile(user, destDirectoryPath, res, commandName, envConstants.types.d).file;
    const allCopiedFiles = [], copiedFilesNames = [];
    
    for (sourcePath of sourcesPaths) {
      let foundFile = findFile(user, sourcePath, res, commandName, envConstants.types.f, false);
      if (!foundFile) {
        const errorMsg = `${commandName}: cannot stat ${sourcePath}: No such file or directory`;
        handleErrors(errorMsg, errors);
        allCopiedFiles.push(errorMsg);
        continue;
      }
  
      const newCopiedFileName = foundFile.file.name;
      const newPath = `${destDirectory.path}/${newCopiedFileName}`;
      // You cannot copy 2 files with the same name at once.
      if (copiedFilesNames.includes(newCopiedFileName)) {
        const errorMsg = `${commandName}: will not overwrite just-created '${newPath}' with '${sourcePath}'`;
        handleErrors(errorMsg, errors);
        allCopiedFiles.push(errorMsg);
        continue;
      }

      removeExisting(user, newPath, envConstants.types.f);
      const copiedFile = copyFile(foundFile, destDirectory, newPath, shouldRemoveSrcFile);
      copiedFilesNames.push(newCopiedFileName);
      allCopiedFiles.push(copiedFile);
    }
  
    return allCopiedFiles;
}

function handleErrors(errorMsg, errors) {
  console.log(errorMsg);
  errors.push(errorMsg);
}

function copyAndOrRemove(user, filePaths, req, res, commandName, shouldRemoveSrcFile=false) {
    let allCopiedFiles;
    validateReq(req, res, commandName);
    const lastFileIndex = filePaths.length - 1;
  
    const errors = [];
    const sourceFile = filePaths[0];
    const destFilePath  = filePaths[lastFileIndex];
    const sourceFileSearchResult = user.findFile(sourceFile, envConstants.types.f);
  
    if (!sourceFileSearchResult.file)
    {
      const errorMsg = `${commandName}: cannot stat ${sourceFileSearchResult.file}: No such file or directory`;
      handleErrors(errorMsg, errors);
    }

    if (filePaths.length === 2) {
      allCopiedFiles = CopySrcFileToDest(user, sourceFileSearchResult, destFilePath, res, commandName, shouldRemoveSrcFile);
    }
    else {
      allCopiedFiles = copyMultipleSourcesToDest(user, res, destFilePath, filePaths.slice(0, lastFileIndex), commandName, shouldRemoveSrcFile);
    }

    environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
    return allCopiedFiles;
  
}

module.exports = copyAndOrRemove;


