const express = require("express");
const authUser = require("../middleware/authUser");
const users = require("../startups/users").users;
const copyOrMoveFiles = require("../helperFunctions/copyOrMoveFiles");

const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
  const commandName = 'mv';
  const { user } = req.user;

  let allCopiedFiles = copyOrMoveFiles(user, req.body.params, req, res, commandName, true);

  console.log("users", JSON.stringify(users[0]));
  console.log(allCopiedFiles);
  res.send(allCopiedFiles);
});

module.exports = router;
