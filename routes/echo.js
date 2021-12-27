const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(" ");
});

router.get("/:word", (req, res) => {
  console.log("trying...");
  res.send(req.params.word);
});

module.exports = router;
