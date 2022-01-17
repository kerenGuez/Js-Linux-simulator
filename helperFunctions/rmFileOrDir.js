const envConstants = require("../configs/envConstants.json");
const environmentVariables = require("../configs/environmentVariables.json");

function displayErrorMessage(errorMsg, resultList, errors) {
    console.log(errorMsg);
    errors.push(errorMsg);
    resultList.push(errorMsg);
}

function RemoveFilesOrDirs(user, pathsToFilesToRemove, commandName, fileType) {
    let allRemovedFiles = [];
    const errors = [];
    
    for (currentFilePath of pathsToFilesToRemove) {                
        let foundFileToRemove = user.findFile(currentFilePath, fileType);

        if (!foundFileToRemove) {
            displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': No such file or directory`, allRemovedFiles, errors);
            continue;
        }
        const containingDir = foundFileToRemove.containingDirectory.content;
        const fileIndex = foundFileToRemove.index;

        if (commandName === "rmdir") {
            if (foundFileToRemove.file.type !== envConstants.types.d) {
                displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': Not a directory`, allRemovedFiles, errors);
                continue;
            }

            if (foundFileToRemove.file.content.length) {
                displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': Directory not empty`, allRemovedFiles, errors);
                continue;
            }
        }

        else if (foundFileToRemove.file.type !== envConstants.types.f && commandName === "rm") {
            displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': Is a directory`, allRemovedFiles, errors);
            continue;
        }
        
        allRemovedFiles.push(foundFileToRemove.file);
        containingDir.splice(fileIndex, 1);
    }

    environmentVariables.EXIT_CODE = errors.length ? 1 : 0;  // 1 signifies an error
    return allRemovedFiles;
}

module.exports = RemoveFilesOrDirs;