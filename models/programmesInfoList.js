const mongodb = require('mongodb');
const database = require('../util/database');

/**
 * This object is used to keep the information of a
 * programme and all the available versions of it.
 */
class ProgrammeInfo {
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
            return database.updateDocumentById(this._id, 'programmes', this);
        } else {
            return database.insertDocument(this, 'programmes');
        }
    }

    /**
     * Retrieves the programmeInfo object of the provided module code/
     * @param {String} programmeCode 
     */
    static getProgrammeInfoByCode(programmeCode) {
        return database.getDocumentByCustomId({ code: programmeCode }, 'programmes');
    }

    /**
     * Returns the list of programmeInfo objects from the database.
     */
    static getProgrammesInfoList() {
        return database.getCollection('programmes');
    }
}

module.exports = ProgrammeInfo;