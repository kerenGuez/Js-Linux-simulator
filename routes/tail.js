const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const getLinesFromArray = require("../helperFunctions/getLinesFromArray");

const router = express.Router();
const DEFAULT_NUM_OF_LINES = 5;

router.post("/:userName", authUser, authFile, (req, res) => {
  const flags = req.body.flags || {};
  const number_of_wanted_lines = flags.n || DEFAULT_NUM_OF_LINES;

  const last_x_lines = getLinesFromArray(req.file, -1 * number_of_wanted_lines)
  res.send(last_x_lines);
});

module.exports = router;
