const envConstants = require("../configs/envConstants.json");
const environmentVariables = require("../configs/environmentVariables.json");

module.exports = (allFiles, numberOfLines) => {
  const errors = [];
  const result =  allFiles.reduce((accumulator, currentFile) => {
    if (allFiles.length > 1) accumulator += `==> ${currentFile.path} <==\n`;

    if (currentFile.type === envConstants.types.d) {
      let commandName = numberOfLines >= 0 ? "head" : "tail";
      let errorMsg = `${commandName}: error reading '${currentFile.path}': Is a directory`;
      errors.push(errorMsg);
      return errorMsg;
    }

    let sentences = currentFile.content.split("\n");
    let wantedLines =
      numberOfLines >= 0
        ? sentences.slice(0, numberOfLines)
        : sentences.slice(numberOfLines);
    return accumulator + wantedLines.join("\n") + "\n";
  }, "");

  environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
  return result;
};
