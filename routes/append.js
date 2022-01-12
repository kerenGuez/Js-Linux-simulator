const express = require("express");
const users = require("../startups/users").users;
const authUser = require("../middleware/authUser");
const envConstants = require("../configs/envConstants.json");
const addFilesToUsers = require("../helperFunctions/addFilesToUsers");

const router = express.Router();
 
router.post("/:userName", authUser, (req, res) => {
  const { user } = req.user;
  const [ content, ...files] = req.body.params;

  let newFiles = addFilesToUsers(req.params["userName"], user, files, true, '-bash', envConstants.types.f, content, false, true);

  console.log("users", JSON.stringify(users[0]));
  console.log(newFiles);
  res.send(newFiles);
});

module.exports = router;
