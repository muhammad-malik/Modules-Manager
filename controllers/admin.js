const Module = require('../models/module');
const Programme = require('../models/programme');
const ModuleInfo = require('../models/modulesInfoList');
const ProgrammeInfo = require('../models/programmesInfoList');
const Submission = require('../models/submissionsList');
const ApprovedSubmissions = require('../models/approvedList');

/**
 * Gets the list of approved submission, either modules or 
 * programmes depending on the type in HTTP request, from the database.
 * Then renders the approved-submissions page.
 * If error, loads the error page.
 */
exports.getApprovedSubmissions = (req, res, next) => {
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";
    const urlParams = req.params;
    const submissionType = urlParams['type'];
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        approvedCollectionName= 'approved-programmes';
    }

    ApprovedSubmissions.getApprovedList(approvedCollectionName).then(approvedSubs => {
        res.render('admin/approved-submissions', {
            approvedSubs: approvedSubs,
            pageTitle: 'Approved Submissions',
            pageType: submissionType,
            path: (submissionType === "module")? '/approvedMod' : '/approvedProg',
            isAdmin: isUserAdmin
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Changes the submission status to approved and creates a
 * new approved-submission object, if doesn't exist for this code and 
 * year, and stores it in database. If the approved-submission object 
 * already exists in the database then it pushes this submission data to 
 * approved-submission submission list.
 */
exports.postApproveSubmission = (req, res, next) => {
    const urlParams = req.params;
    const submissionID = urlParams['submissionID'];
    const submissionType = urlParams['type'];
    let subCollectionName = 'module-submissions';
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        subCollectionName = 'programme-submissions'; 
        approvedCollectionName= 'approved-programmes';
    }

    Submission.approveSubmissionById(submissionID, subCollectionName).then(() => {
        Submission.getSubmissionsById(submissionID, subCollectionName).then(submission => {
            const approvedSubmissionCustomId = submission.code + '-' + submission.year;
            ApprovedSubmissions.getApprovedById(approvedSubmissionCustomId, approvedCollectionName).then(approved => {
                if (approved != null) { // if the approved-submission exist, updates it.
                    let updatedApproved = new ApprovedSubmissions(approved.code, approved.year, approved.currentVersion, approved.status,
                                                                 approved.typeOfEdit, approved.submissions, '', submissionType, approved._id);
                    updatedApproved.addSubmission({'_id': submission._id, 'data':submission.data, 'date': submission.date});
                    return updatedApproved.save(approvedCollectionName).then(() => {
                        res.redirect('/submissions/'+submissionType);
                    });
                } 
                else {  // creates a new approved-submission object.
                    let approved = new ApprovedSubmissions(submission.code, submission.year, submission.currentVersion, 'Waiting', 
                                                            submission.typeOfEdit, [], '', submissionType, null);
                    approved.addSubmission({'_id': submission._id, 'data':submission.data, 'date': submission.date});
                    return approved.save(approvedCollectionName).then(() => {
                        res.redirect('/submissions/'+submissionType);
                    });
                }
            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });;
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });;
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Changes the submission status of the given id to 
 * "Rejected" and updates the feedback property by getting the 
 * data from input form for feedback from the HTTP request body.
 */
exports.postRejectSubmission = (req, res, next) => {
    const urlParams = req.params;
    const submissionID = urlParams['submissionID'];
    const submissionType = urlParams['type'];
    let collectionName = 'module-submissions';
    if (submissionType != "module") {
        collectionName = 'programme-submissions'; 
    }
    const feedback = req.body.feedback;
    Submission.rejectSubmissionById(submissionID, collectionName, feedback).then(() => {
        res.redirect('/submissions/'+submissionType);
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Deletes the submission with the give id from the database.
 */
exports.postDeleteSubmission = (req, res, next) => {
    const urlParams = req.params;
    const submissionID = urlParams['submissionID'];
    const submissionType = urlParams['type'];
    let collectionName = 'module-submissions';
    if (submissionType != "module") {
        collectionName = 'programme-submissions'; 
    }
    Submission.deleteSubmissionById(submissionID, collectionName).then(() => {
        res.redirect('/submissions/'+submissionType);
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Deletes the approved-submission with the give id from the database.
 */
exports.postDeleteApproved = (req, res, next) => {
    const urlParams = req.params;
    const approvedId = urlParams['approvedID'];
    const submissionType = urlParams['type'];
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        approvedCollectionName= 'approved-programmes';
    }

    ApprovedSubmissions.deleteApprovedById(approvedId, approvedCollectionName).then(() => {
        res.redirect('/approved/'+submissionType);
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


/**
 * Takes approved-submission id from the HTTP request.
 * It then generate a new JSON file for the module with the code and 
 * for the year approved-submission was created for. Finally, it adds the
 * information of this new module to the modules-list.  
 */
exports.generateNewModuleFile = (req, res, next) => {
    const urlParams = req.params;
    const approvedId = urlParams['approvedID'];
    const currentDate = new Date();
    const dateAndTime = currentDate.toDateString() + ' - ' + currentDate.toLocaleTimeString();
    const submissionType = urlParams['type'];
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        approvedCollectionName= 'approved-programmes';
    }

    // Retrieving the approved-submission object from database. 
    ApprovedSubmissions.getApprovedById(approvedId, approvedCollectionName).then(approvedSub => {
        const moduleCode = approvedSub.code;
        const year = approvedSub.year;
        const submission = approvedSub.submissions[0];
        const tempModuleData = JSON.parse(submission.data);

        // creating modules files, one in base modules folder and 
        // one in the year it was proposed for.
        Module.createNewModuleFile('base', moduleCode, tempModuleData);
        Module.createNewModuleFile(year, moduleCode, tempModuleData);
        
        // creating new module-info object to add it into modules list.
        const moduleInfo = new ModuleInfo(moduleCode, tempModuleData.title, year, ['base'], null);
        moduleInfo.save();
        
        // updating the approved-submission object.
        ApprovedSubmissions.update(approvedSub._id, approvedCollectionName, { status: 'File Generated', fileGeneratedOn: dateAndTime }).then(() => {
            res.redirect('/approved/'+submissionType);
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Takes approved-submission id from the HTTP request.
 * It then generate updated JSON file for the module with the code and 
 * for the year approved-submission was created for. Finally, it updates the
 * information of this module in the modules-list.  
 */
exports.generateUpdatedModuleFile = (req, res, next) => {
    const urlParams = req.params;
    const approvedId = urlParams['approvedID'];
    const currentDate = new Date();
    const dateAndTime = currentDate.toDateString() + ' - ' + currentDate.toLocaleTimeString();
    const submissionType = urlParams['type'];
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        approvedCollectionName= 'approved-programmes';
    }

    ApprovedSubmissions.getApprovedById(approvedId, approvedCollectionName).then(approvedSub => {
        const moduleCode = approvedSub.code;
        const currentVersion = approvedSub.currentVersion;
        const year = approvedSub.year;

        Module.readModuleFromFiles(moduleCode, currentVersion, currentModuleData => {
            if (currentModuleData === null) {
                const error = new Error();
                error.httpStatusCode = 500;
                return next(error);
            }
            let tempModuleData = currentModuleData;
            for (let sub of approvedSub.submissions) {
                const changes = JSON.parse(sub.data);
                const changesKeys = Object.keys(changes);
                for (let k of changesKeys) {
                    tempModuleData[k] = changes[k];
                }
            }
            Module.createNewModuleFile(year, moduleCode, tempModuleData);
            ModuleInfo.getModuleInfoByCode(moduleCode).then(moduleInfo => {
                let updatedModuleInfo = new ModuleInfo(moduleInfo.code, moduleInfo.title, moduleInfo.latestVersion, moduleInfo.olderVersions, moduleInfo._id);
                if (year != moduleInfo.latestVersion) {
                    updatedModuleInfo.olderVersions.push(moduleInfo.latestVersion);
                    updatedModuleInfo.latestVersion = year;
                    updatedModuleInfo.save();
                }
                ApprovedSubmissions.update(approvedSub._id, approvedCollectionName, { status: 'File Generated', fileGeneratedOn: dateAndTime }).then(() => {
                    res.redirect('/approved/'+submissionType);
                }).catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });;
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Takes approved-submission id from the HTTP request.
 * It then generate a new JSON file for the programme with the code and 
 * for the year approved-submission was created for. Finally, it adds the
 * information of this new programme to the programme-list.  
 */
exports.generateNewProgrammeFile = (req, res, next) => {
    const urlParams = req.params;
    const approvedId = urlParams['approvedID'];
    const currentDate = new Date();
    const dateAndTime = currentDate.toDateString() + ' - ' + currentDate.toLocaleTimeString();
    const submissionType = urlParams['type'];
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        approvedCollectionName= 'approved-programmes';
    }

    ApprovedSubmissions.getApprovedById(approvedId, approvedCollectionName).then(approvedSub => {
        const code = approvedSub.code;
        const year = approvedSub.year;
        const submission = approvedSub.submissions[0];
        const tempProgrammeData = JSON.parse(submission.data);

        Programme.createProgrammeFile('base', code, tempProgrammeData);
        Programme.createProgrammeFile(year, code, tempProgrammeData);
        const programmeInfo = new ProgrammeInfo(code, tempProgrammeData.title, year, ['base'], null);
        programmeInfo.save()
        ApprovedSubmissions.update(approvedSub._id, approvedCollectionName, { status: 'File Generated', fileGeneratedOn: dateAndTime }).then(() => {
            res.redirect('/approved/'+submissionType);
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Takes approved-submission id from the HTTP request.
 * It then generate updated JSON file for the programme with the code and 
 * for the year approved-submission was created for. Finally, it updates the
 * information of this programme in the programme-list.  
 */
exports.generateUpdatedProgrammeFile = (req, res, next) => {
    const urlParams = req.params;
    const approvedId = urlParams['approvedID'];
    const currentDate = new Date();
    const dateAndTime = currentDate.toDateString() + ' - ' + currentDate.toLocaleTimeString();
    const submissionType = urlParams['type'];
    let approvedCollectionName= 'approved-modules';
    if (submissionType != "module") {
        approvedCollectionName= 'approved-programmes';
    }

    ApprovedSubmissions.getApprovedById(approvedId, approvedCollectionName).then(approvedSub => {
        const code = approvedSub.code;
        const currentVersion = approvedSub.currentVersion;
        const year = approvedSub.year;

        Programme.readProgrammeFromFiles(code, currentVersion, currentProgrammeData => {
            if (currentProgrammeData === null) {
                const error = new Error();
                error.httpStatusCode = 500;
                return next(error);
            }
            let tempProgrammeData = currentProgrammeData;
            for (let sub of approvedSub.submissions) {
                const changes = JSON.parse(sub.data);
                const changesKeys = Object.keys(changes);
                for (let k of changesKeys) {
                    tempProgrammeData[k] = changes[k];
                }
            }
            Programme.createProgrammeFile(year, code, tempProgrammeData);
            ProgrammeInfo.getProgrammeInfoByCode(code).then(programmeInfo => {
                let updatedProgInfo = new ModuleInfo(programmeInfo.code, programmeInfo.title, programmeInfo.latestVersion, programmeInfo.olderVersions, programmeInfo._id);
                if (year != programmeInfo.latestVersion) {
                    updatedProgInfo.olderVersions.push(programmeInfo.latestVersion);
                    updatedProgInfo.latestVersion = year;
                    updatedProgInfo.save();
                }
                ApprovedSubmissions.update(approvedSub._id, approvedCollectionName, { status: 'File Generated', fileGeneratedOn: dateAndTime }).then(() => {
                    res.redirect('/approved/'+submissionType);
                }).catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}