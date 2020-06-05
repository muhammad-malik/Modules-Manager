const mongodb = require('mongodb');
const database = require('../util/database');

/**
 * This is schema of the ApprovedSubmission object. This object 
 * is used to store information of the submission which are approved.
 * It is used for both; modules submissions and programmes submission.
 * When a submission is approved by admin, its data will be store in this object
 * in the submissions array. This will allow admin to generate a new module/programme
 * file based on the submissions.
 */
class ApprovedSubmissions {
    constructor(code, year, currentVersion, status, typeOfEdit, submissions, fileGeneratedOn, submissionType, id) {
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.id = code + '-' + year;
        this.code = code;
        this.year = year;
        this.currentVersion = currentVersion;
        this.status = status;
        this.typeOfEdit = typeOfEdit;
        this.submissions = submissions;
        this.fileGeneratedOn = fileGeneratedOn;
        this.submissionType = submissionType;
    }

    /**
     * Takes submission object and pushes it in the submissions array.
     * @param {String} submission
     */
    addSubmission(submission) {     
        this.submissions.push(submission);
    }

    /**
     * Takes a name of the collection, then insert this object in the database
     * approved-submission list to the provided collection. If it already exists,
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
     * find and return the approved-submission object form the database.
     * @param {String} approvedId 
     * @param {String} collectionName 
     */
    static getApprovedById(approvedId, collectionName) {
        return database.getDocumentByCustomId({ id: approvedId}, collectionName);
    }

    /**
     * Takes a collection name and retrieves the list objects 
     * in this collections.
     * @param {String} collectionName 
     */
    static getApprovedList(collectionName) {
        return database.getCollection(collectionName);
    }

    /**
     * Removes the approved-submission object with the id provided
     * from the database.
     * @param {String} approvedId 
     * @param {String} collectionName 
     */
    static deleteApprovedById(approvedId, collectionName) {
        return database.deleteDocumentById(approvedId, collectionName);
    }

    /**
     * Updates the approved-submission object with the id provided
     * from the database.
     * @param {String} approvedId 
     * @param {String} collectionName 
     * @param {Object} updateObject 
     */
    static update(approvedId, collectionName, updateObject ) {
        return database.updateDocumentById(approvedId, collectionName, updateObject);
    }

}

module.exports = ApprovedSubmissions;