const authTheFile = require("./abstractAuthFile");

module.exports = function authFile(req, res, next) {
  const filePath = req.params.filePath;
  console.log('authFile: filePath =', filePath);
  
  const { index, file, dir } = authTheFile(req.user, filePath, res);
  req.file = {
    index: index,
    file: file,
    dir: dir
  };

  next();
};
