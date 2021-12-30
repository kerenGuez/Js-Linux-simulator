const express = require("express");
const { File, validateFile } = require("../resources/file");
const users = require("../startups/users").users;
const { extractPathParameters } = require("../resources/paths");
const authUser = require("../middleware/authUser");
const router = express.Router();
let newFile;

router.post("/:userName", authUser, (req, res) => {
  const { error } = validateFile(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { user } = req.user;
  const { filePath, FilePathWithFileName } = extractPathParameters(req.body.path);
  const fileSearchResult = user.findFile(filePath).file;

  if (!fileSearchResult)
    return res
      .status(400)
      .send(`touch: cannot touch '${filePath}': No such file or directory`);

  newFile = new File(FilePathWithFileName);
  fileSearchResult.content.push(newFile);
  console.log("users", JSON.stringify(users));
  res.send(newFile);
});

module.exports = router;
