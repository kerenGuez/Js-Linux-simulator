// Useful methods for handling file paths
const DEFAULT_SEPARATOR = "/";

// Extract the different path components
function extractPathParameters(
  path,
  separator = DEFAULT_SEPARATOR,
  shouldKeepEmpty = true
) {
  let filePath, fileName;
  const filePathParts = path.split(separator);

  filePath = filePathParts.slice(0, -1).join(separator);
  fileName = [...filePathParts].pop();

  const completeFilePath = `${filePath}${separator}${fileName}`;

  return {
    filePath: filePath,
    fileName: fileName,
    completeFilePath: completeFilePath,
    allPathComponents: shouldKeepEmpty
      ? filePathParts
      : filePathParts.filter((part) => !!part)
  };
}

module.exports.extractPathParameters = extractPathParameters;
