const authTheFile = require("./abstractAuthFile");

module.exports = function authFile(req, res, next) {
  let files = [];  // a list of all files whose path was given.
  for (filePath of req.body.params) {
    let { file } = authTheFile(req.user, filePath, res);
    files.push(file);
  }

  req.file = files;
  next();
};
