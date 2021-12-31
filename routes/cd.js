const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const environmentVariables = require("../configs/environmentVariables.json");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

router.post("/:userName", authUser, authFile, (req, res) => {
  if (req.file.length > 1) return res.status(400).send(`-bash: cd: too many arguments`)
  const [ file ] = req.file;
  const { user } = req.user;
  if ( file.type !== envConstants.types.d ) return res.status(404).send(`-bash: cd: cannot cd '${file.path}': Not a directory`);

  environmentVariables.PWD = file.path;
  // console.log("pwd", environmentVariables.PWD);
  user.currentFile = file;
  // console.log("currentFile", user.currentFile);

  res.send(file.path);
});

module.exports = router;
