const mongodb = require('mongodb');
const database = require('../util/database');

/**
 * This is schema of the ApprovedSubmission object. This object 
 * is used to store the data when a user edits a module or programme. It stores the
 * differences between the original version and edited version of the module/programme.
 * It also has some other properties to indication the version on the edit was
 * made on and what year is it intended for. 
 */
class Submission {
    constructor(code, currentVersion, year, submissionType, typeOfEdit, note, feedback, data, originalData,  date, id) {
        this._id = id ? new mongodb.ObjectId(id) : null
        this.code = code;
        this.currentVersion = currentVersion;
        this.year = year;
        this.submissionType = submissionType;
        this.typeOfEdit = typeOfEdit;
        this.status = 'Submitted';
        this.note = note;
        this.feedback = feedback;
        this.data = data;
        this.originalData = originalData;
        this.date = date;
    }

    /**
     * Takes a name of the collection, then insert this object in the database
     * submission list to the provided collection. If it already exists,
     * then updates it with the current data.
     * @param {String} collectionName 
     */
    save(collectionName) {
        if (this._id) {
            return database.updateDocumentById(this._id, collectionName, this);
        } else {
            return database.insertDocument(this, collectionName);
        }
    }

    /**
     * Takes an custom id and collection name which is then used to 
     * find and return the submission object from the database.
     * @param {String} submissionId 
     * @param {String} collectionName 
     */
    static getSubmissionsById(submissionId, collectionName) {
        return database.getDocumentById(submissionId, collectionName);
    }

    /**
     * Takes a collection name and retrieves the list objects 
     * in this collections.
     * @param {String} collectionName 
     */
    static getSubmissionsList(collectionName) {
        return database.getCollection(collectionName);
    }

    /**
     * Removes the submission object with the id provided
     * from the database.
     * @param {String} approvedId 
     * @param {String} collectionName 
     */
    static deleteSubmissionById(submissionId, collectionName) {
        return database.deleteDocumentById(submissionId, collectionName);
    }

      /**
     * Updates the approved-submission object with the id provided
     * from the database.
     * @param {*} approvedId 
     * @param {*} collectionName 
     * @param {*} updateObject 
     */

    /**
     * Updates the submission status to "Rejected" of the provided id
     * in the database. It also updated it "feedback" property with the
     * provided feedback.
     * @param {String} submissionId 
     * @param {String} collectionName 
     * @param {Object} feedback 
     */
    static rejectSubmissionById(submissionId, collectionName, feedback) {
        return database.updateDocumentById(submissionId, collectionName, { status: 'Rejected', feedback: feedback});
    }

    /**
     * Updates the submission status to "Approved" of the provided id
     * in the database.
     * @param {String} submissionId 
     * @param {String} collectionName 
     */
    static approveSubmissionById(submissionId, collectionName) {
        return database.updateDocumentById(submissionId, collectionName, { status: 'Approved' });
    }

}

module.exports = Submission;