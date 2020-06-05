const path = require('path');
const fs = require('fs');

const rootDir = path.dirname(process.mainModule.filename);

/**
 * Reads a file in the given type and path and returns it as JSON object. 
 * If no file found, returns an null.
 */
exports.readJSONFile = (cb, type, version, name) => {
    // fixes path when running tests
    let tempRootDir = rootDir;
    if (tempRootDir.includes('bin')) {
        tempRootDir = tempRootDir.slice(0, tempRootDir.length-23);
    }
    const filePath = path.join(tempRootDir, 'data', type, version, name + '.json')
    fs.readFile(filePath, (err, fileContent) => {
        if (!err) cb(JSON.parse(fileContent));
        else cb(null);
    });
}

/**
 * Takes a data object and writes in into a JSON file in the 
 * provided path and name. 
 * (Path is formed by joined the type and version. The name of the file is the code
 * All of these files exist in the "data" folder of the root directory of the application.)
 */
exports.writeJSONFile = (type, version, code, data) => {
    // fixes path when running tests
    let tempRootDir = rootDir;
    if (tempRootDir.includes('bin')) {
        tempRootDir = tempRootDir.slice(0, tempRootDir.length-23);
    }
    const filePath = path.join(tempRootDir, 'data', type, version, code + '.json');
    fs.writeFile(filePath, JSON.stringify(data), err => {
        if (err) {
            throw new Error(err);
        }
    });
}