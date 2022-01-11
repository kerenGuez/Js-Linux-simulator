const Joi = require("joi");
const { extractPathParameters } = require("./paths");
const envConstants = require("../configs/envConstants.json");

const NAME_MIN_LEN = 2;
const NAME_MAX_LEN = 20;

class File {
  constructor(
    path,
    content = null,
    type = envConstants.types.f,
    owner = null,
    previousDir = null
  ) {
    this.owner = owner;
    this.path = path;
    this.name =
      this.path === "/" ? "/" : this.path.split(envConstants.separator).pop();
    this.type = type.toLocaleLowerCase();
    this.content = content || (this.type === envConstants.types.f ? "" : []);
    this.dateCreated = new Date();
    this.sizeBytes =
      this.type === envConstants.types.f ? this.content.length : 0;
    this.previousDir = previousDir;
  }

  clone(path) {
    return new File(path, this.content, this.type, this.owner, this.previousDir);
  }

  relativeFindFile(filePath, type = null, currentFile = null, currentFileIndex = null, currentDir = "/") {
    currentFile = currentFile ? currentFile : this;

    let { allPathComponents } = extractPathParameters(filePath, envConstants.separator, false);
    if (allPathComponents.length < 1)
      return {
        index: currentFileIndex,
        file: currentFile,
        containingDirectory: currentDir,
      };

    const pathPartToSearch = allPathComponents.shift();

    const foundFileIndex = currentFile.content.findIndex(
      (file) => {
        if (allPathComponents.length) {
          if (file.type !== envConstants.types.d) return false;
        }

        else {
          if (type && file.type !== type) return false;
        }
        return file.name === pathPartToSearch
      }
    );

    return foundFileIndex !== -1
      ? this.relativeFindFile(
          allPathComponents.join(envConstants.separator),
          type,
          currentFile.content[foundFileIndex],
          foundFileIndex,
          currentFile,
        )
      : false;
  }

  addFile(newFile) {
    const { filePath } = extractPathParameters(
      newFile.path,
      envConstants.separator
    );
    const { file } = this.relativeFindFile(filePath);
    if (newFile.type === envConstants.types.d) newFile.previousDir = file;
    if (file) return file.content.push(newFile);
    console.warn("File not found!");
    return;
  }

  removeFile(fileToRemove, type) {
    const { filePath } = extractPathParameters(
      fileToRemove.path,
      envConstants.separator
    );

    const { file } = this.relativeFindFile(filePath);
    const foundFileIndex = file.content.findIndex(
      (currFile) => currFile.name === fileToRemove.name
    );

    // to handle the case you have a directory and file with the same name on the same folder
    if (file.content[foundFileIndex].type === type) {
      if (foundFileIndex !== -1) return file.content.splice(foundFileIndex, 1);

      console.warn("File not found!");
      return;
    }
  
    console.warn(
      `cannot remove '${file.content[foundFileIndex].name}': Not a ${type}`
    );
    return;
  }
}

function validateFile(file) {
  const schema = Joi.object({
    path: Joi.string().min(1).required(),
    name: Joi.string().min(NAME_MIN_LEN).max(NAME_MAX_LEN),
    type: Joi.string().valid(envConstants.types.f, envConstants.types.d),
    content: file.type === envConstants.types.d ? Joi.array() : Joi.string(),
    dateCreated: Joi.date(),
  });

  return schema.validate(file);
}

module.exports.File = File;
module.exports.validateFile = validateFile;
