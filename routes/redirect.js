const express = require("express");
const users = require("../startups/users").users;
const authUser = require("../middleware/authUser");
const baseDirs = require("../configs/baseDirs.json");

const router = express.Router();

function redirect(content, filePath) {


}
 
router.post("/:userName", authUser, (req, res) => {
  const { user } = req.user;

  let allCopiedFiles = copyOrMoveFiles(user, req.body.params, req, res, commandName);

  console.log("users", JSON.stringify(users[0]));
  console.log(allCopiedFiles);
  res.send(allCopiedFiles);
});

module.exports = router;
