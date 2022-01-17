const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const environmentVariables = require("../configs/environmentVariables.json");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

function handleError(res, errorMsg, errors) {
  errors.push(errorMsg);
  return res.send(errorMsg);
}

router.post("/:userName", authUser, authFile, (req, res) => {
  const errors = [];
  const [ file ] = req.file;
  const { user } = req.user;

  if (req.file.length > 1) {
    let errorMsg = `-bash: cd: too many arguments`;
    handleError(res, errorMsg, errors)
  }
 
  if ( file.type !== envConstants.types.d ) {
    let errorMsg = `-bash: cd: cannot cd '${file.path}': Not a directory`;
    handleError(res, errorMsg, errors)
  }

  environmentVariables.PWD = file.path;
  user.currentFile = file;

  res.send(file.path);
});

module.exports = router;
