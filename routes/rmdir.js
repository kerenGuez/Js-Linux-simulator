const express = require("express");
const authUser = require("../middleware/authUser");
const users = require("../startups/users").users;
const rmFileOrDir = require("../helperFunctions/rmFileOrDir");

const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
  const { user } = req.user;

  let removedFiles = rmFileOrDir(user, req.body.params, 'rmdir');

  console.log("users", JSON.stringify(users[0]));
  res.send(JSON.stringify(removedFiles));
});

module.exports = router;
