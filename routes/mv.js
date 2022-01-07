const express = require("express");
const authUser = require("../middleware/authUser");
const authFile = require("../middleware/authFile");
const users = require("../startups/users").users;
const { validateFile } = require("../resources/file");
const { extractPathParameters } = require("../resources/paths");

const router = express.Router();

// TODO generic function for mv and cp
router.post("/:userName", authUser, authFile, (req, res) => {
  const { filePath, FilePathWithFileName } = extractPathParameters(req.body.path);
  const { user } = req.user;

  const fileSearchResult = user.findFile(filePath).file;

  if (!fileSearchResult)
    return res
      .status(400)
      .send(`mv: cannot mv '${filePath}': No such file or directory`);

  const { index, file } = req.file;
  const copiedFile = file.clone(FilePathWithFileName);

  fileSearchResult.content.push(copiedFile);
  fileSearchResult.content.splice(index, 1);
  console.log("users", JSON.stringify(users));
  res.send(copiedFile);
});

module.exports = router;
