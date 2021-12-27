const express = require("express");
const authUser = require("../middleware/authUser");
const environmentVariables = require("../configs/environmentVariables.json");


const router = express.Router();

router.get("/:userName", authUser, (_, res) => {
    res.send(environmentVariables.PWD);
  });

module.exports = router;
