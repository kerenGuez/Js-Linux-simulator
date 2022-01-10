const envConstants = require("../configs/envConstants.json");

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
  
    if (req.body.params === 1)
      return res.status(400).send(`${commandName}: missing destination file operand after ${req.body.params[0]}`);
}

function findFile(user, filePath, res, commandName, throwError=true) {
    const foundFile = user.findFile(filePath);
    if (!foundFile && throwError)
      return res
        .status(400)
        .send(`${commandName}: cannot create regular file '${filePath}': No such file or directory`);
  
    return foundFile;
}

function CopySrcFileToDest(user, sourceFile, destFilePath, res, commandName, shouldRemoveSrcFile=false) {
    let destinationDirectory;
    const fileNamePattern = "\\w+(?:\\.\\w+)*?$";
  
    const fileNamePart = destFilePath.match(new RegExp(`^${fileNamePattern}`))
    if (!fileNamePart) {
      const destDirPath = destFilePath;
      destinationDirectory = findFile(user, destDirPath, res, commandName).file;
      
      fileName = sourceFile.file.name;
    }
    else {
      fileName = fileNamePart[0];
      destinationDirectory = user.currentFile;
    }
    
    const copiedFile = copyFile(sourceFile, destinationDirectory, `${destinationDirectory.path}/${fileName}`, shouldRemoveSrcFile);
    return copiedFile;
}

function copyMultipleSourcesToDest(user, res, destDirectoryPath, sourcesPaths, commandName, shouldRemoveSrcFile=false) {
    const destDirectory = findFile(user, destDirectoryPath, res, commandName).file;
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
  
      const copiedFile = copyFile(foundFile, destDirectory, `${destDirectory.path}/${foundFile.file.name}`, shouldRemoveSrcFile);
      allCopiedFiles.push(copiedFile);
    }
  
    return allCopiedFiles;
}

function copyAndOrRemove(user, filePaths, req, res, commandName, shouldRemoveSrcFile=false) {
    let allCopiedFiles;
    validateReq(req, res, commandName);
    const lastFileIndex = filePaths.length - 1;
  
    const sourceFile = filePaths[0];
    const destFilePath  = filePaths[lastFileIndex];
    const sourceFileSearchResult = user.findFile(sourceFile);
  
    if (!sourceFileSearchResult.file)
      console.log(`${commandName}: cannot stat ${sourceFileSearchResult.file}: No such file or directory`)
  
    if (filePaths.length === 2) {
      allCopiedFiles = CopySrcFileToDest(user, sourceFileSearchResult, destFilePath, res, commandName, shouldRemoveSrcFile);
    }
    else {
      allCopiedFiles = copyMultipleSourcesToDest(user, res, destFilePath, filePaths.slice(0, lastFileIndex), commandName, shouldRemoveSrcFile);
    }
    return allCopiedFiles;
  
}

module.exports = copyAndOrRemove;


