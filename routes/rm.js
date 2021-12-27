const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const users = require("../startups/users").users;
const envConstants = require("../configs/envConstants.json");
const router = express.Router();

router.delete("/:userName/:filePath(*)", authUser, authFile, (req, res) => {
  const { file } = req.file;
  const { user } = req.user;
  const deletedFile = user.removeFile(file, envConstants.types.f);

  console.log("users after delete", JSON.stringify(users));
  res.send(deletedFile);
});

module.exports = router;
