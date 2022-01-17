const express = require("express");
const authUser = require("../middleware/authUser");
const environmentVariables = require("../configs/environmentVariables.json");
const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
  const errors = [];
  content = req.body.params.reduce((accumulator , currentParam) => { 
    return accumulator + ` ${currentParam}`;
  }, "");

  environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
  res.send(content.slice(1));
});

module.exports = router;
