const envConstants = require("../configs/envConstants.json");

module.exports = (allFiles, numberOfLines) => {
  return allFiles.reduce((accumulator, currentFile) => {
    if (allFiles.length > 1) accumulator += `==> ${currentFile.path} <==\n`;

    if (currentFile.type === envConstants.types.d) {
      let commandName = numberOfLines >= 0 ? "head" : "tail";
      return `${commandName}: error reading '${currentFile.path}': Is a directory`;
    }

    let sentences = currentFile.content.split("\n");
    let wantedLines =
      numberOfLines >= 0
        ? sentences.slice(0, numberOfLines)
        : sentences.slice(numberOfLines);
    return accumulator + wantedLines.join("\n") + "\n";
  }, "");
};
