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
    new File(`/root/file3.txt`, `1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n11\n12\n13\n14\n15`)
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
