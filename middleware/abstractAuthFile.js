const { File } = require("../resources/file");

module.exports = function authTheFile(reqUser, filePaths, res, stdin=null, shouldIncludeIndex=false) {
    let files = [];  // a list of all files whose path was given.
    let fileSearchResult;
    const { user } = reqUser;

    if (!filePaths | !filePaths.length) {
      if (stdin || stdin === '')
        return [new File(``, stdin)];

      return res.status(401).send("Access denied, no filePath provided.");
    }

    for (filePath of filePaths){
      fileSearchResult = user.findFile(filePath);
      if (!fileSearchResult) return res.status(404).send("Invalid filePath.");
      
      if (shouldIncludeIndex) {
        files.push({
          index: fileSearchResult.index,
          file: fileSearchResult.file,
        });
      }
      else files.push(fileSearchResult.file);
      
      //{
      //  index: fileSearchResult.index,
      //  file: fileSearchResult.file,
      //  dir: fileSearchResult.containingDirectory
      //}
    }
  
    return files;
  };
  