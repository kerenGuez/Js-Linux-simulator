const envConstants = require("../configs/envConstants.json");

function displayErrorMessage(errorMsg, resultList) {
    console.log(errorMsg);
    resultList.push(errorMsg);
}

function RemoveFilesOrDirs(user, pathsToFilesToRemove, commandName) {
    let allRemovedFiles = [];
    
    for (currentFilePath of pathsToFilesToRemove) {                
        let foundFileToRemove = user.findFile(currentFilePath);

        if (!foundFileToRemove) {
            displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': No such file or directory`, allRemovedFiles);
            continue;
        }
        const containingDir = foundFileToRemove.containingDirectory.content;
        const fileIndex = foundFileToRemove.index;

        if (commandName === "rmdir") {
            if (foundFileToRemove.file.type !== envConstants.types.d) {
                displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': Not a directory`, allRemovedFiles);
                continue;
            }

            if (foundFileToRemove.file.content.length) {
                displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': Directory not empty`, allRemovedFiles);
                continue;
            }
        }

        else if (foundFileToRemove.file.type !== envConstants.types.f && commandName === "rm") {
            displayErrorMessage(`${commandName}: cannot remove '${currentFilePath}': Is a directory`, allRemovedFiles);
            continue;
        }
        
        allRemovedFiles.push(foundFileToRemove.file);
        containingDir.splice(fileIndex, 1);
    }
    return allRemovedFiles;
}

module.exports = RemoveFilesOrDirs;