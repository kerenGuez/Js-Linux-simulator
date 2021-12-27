const express = require("express");
const { File, validateFile } = require("../resources/file");
const users = require("../startups/users").users;
const { extractPathParameters } = require("../resources/paths");
const authUser = require("../middleware/authUser");
const envConstants = require("../configs/envConstants.json");
const router = express.Router();
let newFile;

router.post("/:userName", authUser, (req, res) => {
  const { error } = validateFile(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { user } = req.user;
  const { filePath, completeFilePath } = extractPathParameters(req.body.path);
  console.log("mkdir: completeFilePath", completeFilePath);
  const fileSearchResult = user.findFile(filePath).file;

  if (!fileSearchResult)
    return res
      .status(400)
      .send(`mkdir: cannot mkdir '${filePath}': No such file or directory`);

  newFile = new File(completeFilePath, null, envConstants.types.d);
  fileSearchResult.content.push(newFile);
  console.log("users", JSON.stringify(users));
  res.send(newFile);
});

module.exports = router;
