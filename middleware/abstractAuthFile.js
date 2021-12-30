module.exports = function authTheFile(reqUser, filePath, res) {
    let fileSearchResult;
    const { user } = reqUser;
    // const fileToSearchFrom = filePath.startsWith('/') ? user : currentFile;

    if (!filePath)
      return res.status(401).send("Access denied, no filePath provided.");

    fileSearchResult = user.findFile(filePath);


    if (!fileSearchResult) return res.status(404).send("Invalid filePath.");
  
    return {
      index: fileSearchResult.index,
      file: fileSearchResult.file,
      dir: fileSearchResult.containingDirectory
    };
  };
  