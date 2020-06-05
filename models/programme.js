const fileFunctions = require('../util/files.js');

/**
 * Programme Specification used to create a new Programme file.
 * Takes an data object which contains the data this
 * programme will consist of.
 */
class Programme {
    constructor(formData) {

        this.title = formData.title;
        this.code = formData.code;
        this.director = {
            "name": formData.directorName,
            "email": formData.directorEmail
        };
        this.num_modules = formData.numOfModules;
        this.modules = {};

        for (let i=0; i<4; i++) {
            if (formData['modules'+i] != "") {
                for (let j=0; j<12; j++) {
                    if (formData['modules'+i+'obj'+j] != "") {
                        if (j==0) {
                            this.modules[formData['modules'+i]] = [formData['modules'+i+'obj'+j]];
                        } else {
                            this.modules[formData['modules'+i]].push(formData['modules'+i+'obj'+j]);
                        }
                    }
                }
            }      
        }

    }

    /**
     * Creates the programme JSON file for the provided year.
     * @param {String} year 
     * @param {String} code 
     * @param {Object} data 
     */
    static createProgrammeFile(year, code, data) {
        fileFunctions.writeJSONFile('programmes', year, code, data);
    }

    /**
     * Reads the programme file from the storage and return it in a callback.
     * @param {String} programmeCode 
     * @param {String} version 
     * @param {Callback} cb 
     */
    static readProgrammeFromFiles(programmeCode, version, cb) {
        fileFunctions.readJSONFile(cb, 'programmes', version, programmeCode);
    }

    /**
     * Takes a programme and compare it to this programme. Then returns an
     * object in the callback which consist of the all the properties which 
     * were different in this programme compare to the other programme.
     * @param {Programme Object} otherProg 
     * @param {Callback} cb 
     */
    static getDifferences(firstProg, otherProg, cb) {
        let differences = {};

        if (firstProg.title != otherProg.title) differences['title'] = firstProg.title;
        if (firstProg.code != otherProg.code) differences['code'] = firstProg.code;
        if (JSON.stringify(firstProg.director) != JSON.stringify(otherProg.director)) differences['director'] = firstProg.director;
        if (firstProg.num_modules != otherProg.num_modules) differences['num_modules'] = firstProg.num_modules;
        if (JSON.stringify(firstProg.modules) != JSON.stringify(otherProg.modules)) differences['modules'] = firstProg.modules;
        
        cb(differences);
    }
}

module.exports = Programme