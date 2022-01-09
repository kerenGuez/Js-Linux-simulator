const express = require("express");
const users = require("../startups/users").users;
const authUser = require("../middleware/authUser");
const envConstants = require("../configs/envConstants.json");
const addFilesToUsers = require("../helperFunctions/addFilesToUsers");
const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
  const { user } = req.user;

  let newFiles = addFilesToUsers(req.params["userName"], user, req.body.params, true, 'touch', envConstants.types.f);

  console.log("users", JSON.stringify(users[0]));
  res.send(JSON.stringify(newFiles));
});

module.exports = router;
