const authTheFile = require("./abstractAuthFile");

module.exports = function authFile(req, res, next) {
  let files = authTheFile(req.user, req.body.params, res);
  req.file = files;
  next();
};
