const authTheFile = require("./abstractAuthFile");

module.exports = function authFile(req, res, next) {
  const filePath = req.body.path;

  const { index, file, dir } = authTheFile(req.user, filePath, res);
  req.fileInBody = {
    fileIndex: index,
    foundFile: file,
    foundDir: dir,
  };

  next();
};
