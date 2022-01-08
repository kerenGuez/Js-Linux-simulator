const { File } = require("../resources/file");

module.exports = function authTheFile(reqUser, filePaths, res, stdin=null) {
    let files = [];  // a list of all files whose path was given.
    let fileSearchResult;
    const { user } = reqUser;

    if (!filePaths | !filePaths.length) {
      if (stdin)
        return [new File(``, stdin)];

      return res.status(401).send("Access denied, no filePath provided.");
    }

    for (filePath of filePaths){
      fileSearchResult = user.findFile(filePath);
      if (!fileSearchResult) return res.status(404).send("Invalid filePath.");

      //  {
-     //    index: fileSearchResult.index,
-     //    file: fileSearchResult.file,
-     //    dir: fileSearchResult.containingDirectory
-     //  }
      files.push(fileSearchResult.file);
    }
  
    return files;
  };
  