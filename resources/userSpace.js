const Joi = require("joi");
const { File } = require("./file");
const baseDirs = require("../configs/baseDirs.json");
const environmentVariables = require("../configs/environmentVariables.json");

const NAME_MIN_LEN = 2;
const NAME_MAX_LEN = 20;

// Create a list of all of the base directories according to the config.
function createBaseDirs(baseDirs) {
  const rootDirectory = new File(
    `${baseDirs.rootPath}`,
    (content = null),
    (type = "directory")
  );
  baseDirs.rootFolders.map((dirName) => {
    return rootDirectory.content.push(
      new File(
        `${baseDirs.rootPath}${dirName}`,
        (content = null),
        (type = "directory")
      )
    );
  });
  return rootDirectory;
}

class UserSpace {
  constructor(userName, filesToStartWith) {
    this.userName = userName.toLowerCase();
    this.files = createBaseDirs(baseDirs);
    for (let file of filesToStartWith) this.files.addFile(file);
    this.currentFile = this.findFile(
      environmentVariables.PWD
    ).file;
  }

  findFile(filePath) {
    // Absolute path search  
    if (filePath.startsWith(baseDirs.rootPath)) {
      return this.files.relativeFindFile(filePath);
    }

    // Relative path search
    return this.currentFile.relativeFindFile(filePath);
  }
}

function validateUserSpace(userSpace) {
  const schema = Joi.object({
    userName: Joi.string().min(NAME_MIN_LEN).max(NAME_MAX_LEN).required(),
    files: Joi.array(),
  });

  return schema.validate(userSpace);
}

module.exports.UserSpace = UserSpace;
module.exports.validateUserSpace = validateUserSpace;
