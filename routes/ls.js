const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const envConstants = require("../configs/envConstants.json");
const environmentVariables = require("../configs/environmentVariables.json");
const router = express.Router();

router.post("/:userName", authUser, authFile, (req, res) => {
  const errors = [];
  const lsResult = req.file.reduce((accumulator, currentFile, currentIndex) => {
    const currentFilePath = req.body.params[currentIndex];

    if (currentFile.type === envConstants.types.f)
      return accumulator + "\n" + currentFilePath;

    if (req.file.length > 1 && currentFile.type === envConstants.types.d)
      accumulator += `${currentFilePath}:\n`;

    return (
      accumulator +
      currentFile.content
        .map((fileInDir) => `name: ${fileInDir.name}, type: ${fileInDir.type}`)
        .join("\n") + "\n"
    );
  }, "");

  environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
  res.send(lsResult.slice(0));
});

module.exports = router;
