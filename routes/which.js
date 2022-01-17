var fs = require("fs");
const express = require("express");
const environmentVariables = require("../configs/environmentVariables.json");

const authUser = require("../middleware/authUser");

const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
    const errors = [];
    var text = fs.readFileSync('temp.txt','utf8')
    const possibleRoutes = text.split('\n');

    const content = req.body.params.reduce((accumulator , currentCommand) => {
        return accumulator + (possibleRoutes.includes(currentCommand) ? `/usr/bin/${currentCommand}\n` : "");
    }, "");
 
    environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
    res.send(content.replace(/\n$/, ""));
});

module.exports = router;
