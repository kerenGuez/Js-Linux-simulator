const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const environmentVariables = require("../configs/environmentVariables.json");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

router.put("/:userName/:filePath(*)", authUser, authFile, (req, res) => {
  const { file } = req.file;
  if ( file.type !== envConstants.types.d ) return res.status(400).send(`cd: cannot cd '${file.path}': Not a directory`);

  environmentVariables.PWD = file.path

  res.send(file.path);
});

module.exports = router;
