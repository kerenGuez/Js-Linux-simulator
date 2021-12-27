const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");

const router = express.Router();


router.get("/:userName/:filePath(*)", authUser, authFile, (req, res) => {
  const { file } = req.file;
  console.log("cat: file =", file);
  console.log("cat: filePath =", req.params.filePath);
  res.send(file.content);
});

module.exports = router;
