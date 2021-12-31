const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const envConstants = require("../configs/envConstants.json");

const router = express.Router();
const DEFAULT_NUM_OF_LINES = 10;

router.post("/:userName", authUser, authFile, (req, res) => {
  const flags = req.body.flags || {};
  const number_of_wanted_lines = flags.n || DEFAULT_NUM_OF_LINES;

  const headResult = req.file.reduce((accumulator , currentFile) => 
  {
    if (req.file.length > 1 )
      accumulator += `==> ${currentFile.path} <==\n`;
  
    if ( currentFile.type === envConstants.types.d ) 
      return `head: error reading '${currentFile.path}': Is a directory`;
  
    return accumulator + currentFile.content
    .split("\n")
    .slice(0, number_of_wanted_lines)
    .join("\n") + "\n";
  
  }, "");

  res.send(headResult);

});

module.exports = router;
