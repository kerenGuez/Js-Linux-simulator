const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");

const router = express.Router();

router.get("/:userName/:filePath(*)", authUser, authFile, (req, res) => {
  const { file } = req.file;
  const resultText = file.content.map( currentFile => ({ name: currentFile.name, type: currentFile.type }) );
  res.send(JSON.stringify(resultText));
});

module.exports = router;
