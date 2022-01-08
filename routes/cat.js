const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();

router.post("/:userName", authUser, authFile, (req, res) => {
  // TODO : validate 'req.body.params' to be an array of filepath strings.
  let content = "";

  for (theFile of req.file) {
    if (theFile.type == envConstants.types.d)
      content += `cat: ${theFile.path}: Is a directory\n`;
    else content += theFile.content + "\n";
  }

  res.send(content.replace(/\n$/g, ''));
});

module.exports = router;
