var fs = require("fs");
const express = require("express");

const authUser = require("../middleware/authUser");

const router = express.Router();

router.post("/:userName", authUser, (req, res) => {
    var text = fs.readFileSync('temp.txt','utf8')
    const possibleRoutes = text.split('\n');

    const content = req.body.params.reduce((accumulator , currentCommand) => {
        return accumulator + (possibleRoutes.includes(currentCommand) ? `/usr/bin/${currentCommand}\n` : "");
    }, "");
 
    res.send(content.replace(/\n$/, ""));
});

module.exports = router;
