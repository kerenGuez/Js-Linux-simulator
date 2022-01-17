const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const envConstants = require("../configs/envConstants.json");
const environmentVariables = require("../configs/environmentVariables.json");

const router = express.Router();

router.post("/:userName", authUser, authFile, (req, res) => {
  // TODO : validate 'req.body.params' to be an array of filepath strings.
  let content = "";
  const errors = [];

  for (theFile of req.file) {
    if (theFile.type == envConstants.types.d) {
      let errorMsg = `cat: ${theFile.path}: Is a directory\n`;
      content += errorMsg;
      errors.push(errorMsg);
    }
    else content += theFile.content + "\n";
  }

  environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
  res.send(content.replace(/\n$/g, ''));
});

module.exports = router;
