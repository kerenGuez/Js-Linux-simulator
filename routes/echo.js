const express = require("express");
const authUser = require("../middleware/authUser");
const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
  content = req.body.params.reduce((accumulator , currentParam) => { 
    return accumulator + ` ${currentParam}`;
  }, "");
  res.send(content.slice(1));
});

module.exports = router;
