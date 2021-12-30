const authTheFile = require("./abstractAuthFile");

module.exports = function authFile(req, res, next) {
  // const filePath = req.params.filePath;
  let files = [];  // a list of all files whose path was given.
  for (filePath of req.body.params) {
    let { file } = authTheFile(req.user, filePath, res);
    files.push(file);
  }

  // let { index, file, dir } = authTheFile(req.user, filePath, res);
  // req.file = {
  //   index: index,
  //   file: file,
  //   dir: dir
  // };
  req.file = files;
  // console.log('authFile: req.file =', req.file);

  next();
};
