const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");

const router = express.Router();
const DEFAULT_NUM_OF_LINES = 5;

router.get("/:userName/:filePath(*[^0-9])/:numLines?", authUser, authFile, (req, res) => {
  const { file } = req.file;
  const number_of_wanted_lines = req.params.numLines
    ? req.params.numLines
    : DEFAULT_NUM_OF_LINES;
  const last_x_lines = file.content
    .split("\n")
    .slice(-1 * number_of_wanted_lines)
    .join("\n");
  res.send(last_x_lines);
});

module.exports = router;
