const express = require("express");
const authUser = require("../middleware/authUser");
const environmentVariables = require("../configs/environmentVariables.json");

const router = express.Router();

router.post("/:userName", authUser, (_, res) => {
    const errors = [];
    environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
    res.send(environmentVariables.PWD);
  });

module.exports = router;
