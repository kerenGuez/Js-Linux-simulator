const { File } = require("../resources/file");
const { UserSpace } = require("../resources/userSpace");

// Namespaces for each different user, to have a separate environment
const users = [
  new UserSpace("keren", [
    new File(
      `/root/file1.txt`,
      `File content
    
      with lines
  
      `
    ),
    new File(`/root/file2.txt`, `Some Different Content`),
  ]),
  new UserSpace("yariv", []),
];

function findUser(userName) {
  return users.find((user) => user.userName === userName);
}

// console.log("users: users", JSON.stringify(users));

module.exports.users = users;
module.exports.findUser = findUser;
module.exports.currentPath = { path: "/root" };
