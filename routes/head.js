const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const getLinesFromArray = require("../helperFunctions/getLinesFromArray");

const router = express.Router();
const DEFAULT_NUM_OF_LINES = 10;

router.post("/:userName", authUser, authFile, (req, res) => {
  const flags = req.body.flags || {};
  const number_of_wanted_lines = Number(flags.n) || DEFAULT_NUM_OF_LINES;

  const headResult = getLinesFromArray(req.file, number_of_wanted_lines);

  res.send(headResult);
});

module.exports = router;
