const users = require("../startups/users").users;

module.exports = function authUser(req, res, next) {
  const userName = req.params.userName;
  if (!userName)
    return res.status(401).send("Access denied, no userName provided.");

  const chosenUserIndex = users.findIndex(
    (currUser) => currUser.userName === userName
  );

  if (chosenUserIndex === -1) return res.status(400).send("Invalid userName.");

  req.user = {
    index: chosenUserIndex,
    user: users[chosenUserIndex],
    currentFile: users[chosenUserIndex].currentFile
  };

  next();
};
