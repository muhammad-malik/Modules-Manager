const mongodb = require('mongodb');
const database = require('../util/database');

/**
 * This object is used to keep the information of a
 * module and all the available versions of it.
 */
class ModuleInfo {
    constructor(code, title, latestVersion, olderVersions, id) {
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.code = code;
        this.title = title;
        this.latestVersion = latestVersion;
        this.olderVersions = olderVersions;
    }

    /**
     * Insert or update this object in the database.
     */
    save() {
        if (this._id) {
            return database.updateDocumentById(this._id, 'modules', this);
        } else {
            return database.insertDocument(this, 'modules');
        }
    }

    /**
     * Retrieves the moduleInfo object of the provided module code.
     * @param {String} moduleCode 
     */
    static getModuleInfoByCode(moduleCode) {
        return database.getDocumentByCustomId({ code: moduleCode}, 'modules');
    }

    /**
     * Returns the list of modulesInfo objects from the database.
     */
    static getModulesInfoList() {
        return database.getCollection('modules');
    }
}

module.exports = ModuleInfo;