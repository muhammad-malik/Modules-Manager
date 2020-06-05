const Module = require('../models/module');
const Programme = require('../models/programme');
const ModuleInfo = require('../models/modulesInfoList');
const ProgrammeInfo = require('../models/programmesInfoList');
const Submission = require('../models/submissionsList');


/**
 * Renders the home page of the application.
 */
exports.getIndex = (req, res, next) => {
    const cookie = req.get('Cookie');
    let isUserAdmin = false;

    // checks if cookie exist, then gets the type of user, 
    // else creates a new cookie and stores the user type as staff.
    if (cookie) {
        const userType = cookie.split('=')[1];
        if (userType === "admin") isUserAdmin = true;
    } else {
        res.cookie('userType', 'staff', { path: '/' });
    }

    return res.render('staff/index', {
        pageTitle: 'Home',
        path: '/',
        isAdmin: isUserAdmin
    });
};

/**
 * Gets the list of modules from the database,
 * then renders the modules-programmes-list page.
 * If error, loads the error page.
 */
exports.getModules = (req, res, next) => {
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";

    return ModuleInfo.getModulesInfoList().then(modules => {
        return res.render('staff/modules-programmes-list', {
            dataList: modules,
            pageType: 'modules',
            pageTitle: 'All Modules',
            path: '/modules',
            isAdmin: isUserAdmin
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

/**
 * Gets the module code and versions from the HTTP request
 * and loads the module data from JSON files. Then renders the 
 * view-module-programme page with the required data provided.
 */
exports.viewModule = (req, res, next) => {
    const urlParams = req.params;
    const moduleCode = urlParams['code'];
    const latestVersion = urlParams['latestVersion'];
    const previousVersion = urlParams['previousVersion'];
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";
    return ModuleInfo.getModuleInfoByCode(moduleCode).then(moduleInfo => {
        return Module.readModuleFromFiles(moduleCode, latestVersion, module2 => {
            return Module.readModuleFromFiles(moduleCode, previousVersion, module1 => {
                // if error occurs, the object will be null.
                // It will then render the error page instead.
                if (module1 === null || module2 === null) {
                    const error = new Error();
                    error.httpStatusCode = 500;
                    return next(error);
                }
                return res.render('staff/view-module-programme', {
                    dataInfo: moduleInfo,
                    dataOneVersion: previousVersion,
                    datTwoVersion: latestVersion,
                    dataOne: module1,
                    dataTwo: module2,
                    isData: true,
                    pageType: 'modules',
                    pageTitle: 'View ' + moduleCode,
                    path: '/modules',
                    emptyOb: {},
                    isAdmin: isUserAdmin
                });
            });
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Gets the module code and version from the HTTP request,
 * and reads the module JSON file. It then renders edit-module page
 * and supply necessary data. (some keys of the objects in modules specification
 * to help build the form and get data from the read JSON file). 
 */
exports.editModule = (req, res, next) => {

    const urlParams = req.params;
    const moduleCode = urlParams['code'];
    const version = urlParams['version'];
    const type = urlParams['type'];
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";

    return Module.readModuleFromFiles(moduleCode, version, module => {

        // if module is null, render error page.
        if (module === null) {
            const error = new Error();
            error.httpStatusCode = 500;
            return next(error);
        }

        // Preparing keys of module specification properties 
        // which are used to generate the form and get data
        // for the fields.
        let objectiveItemKey = moduleCode.substr(5);
        let objectiveItemKeys = [];
        let assessmentKeys = Object.keys(module.assessment);
        let prerequisitesKeys = [];
        let assessmentTimetableKeys = [];
        let accreditationLength = module.accreditation.length;
        let accreditationOneCriteriaKeys = [];
        let accreditationTwoCriteriaKeys = [];

        if (type === "New") {
            objectiveItemKey = "OBJ";
        }

        if (module.objectives[0] != null && module.objectives[0] != {}) {
            objectiveItemKeys.push(Object.keys(module.objectives[0].items));
        }

        if (module.objectives[1] != null && module.objectives[1] != {}) {
            objectiveItemKeys.push(Object.keys(module.objectives[1].items));
        } else {
            objectiveItemKeys.push([]);
        }

        if (module.objectives[2] != null && module.objectives[2] != {}) {
            objectiveItemKeys.push(Object.keys(module.objectives[2].items));
        } else {
            objectiveItemKeys.push([]);
        }

        if (module.prerequisites != undefined && module.prerequisites != {}) {
            prerequisitesKeys = Object.keys(module.prerequisites);
        }

        if (module.assessment_timetable != undefined && module.assessment_timetable != {}) {
            assessmentTimetableKeys = Object.keys(module.assessment_timetable);
        }

        if (module.accreditation[0].criteria_mapping != {}) {
            accreditationOneCriteriaKeys = Object.keys(module.accreditation[0].criteria_mapping);
        }

        if (module.accreditation[1] != null && module.accreditation[1].criteria_mapping != {}) {
            accreditationTwoCriteriaKeys = Object.keys(module.accreditation[1].criteria_mapping);
        }

        return res.render('staff/edit-module', {
            type: type,
            version: version,
            data: module,
            isData: true,
            pageTitle: 'Edit ' + moduleCode,
            path: '/modules',

            objectiveItemKey: objectiveItemKey,
            objectiveItemKeys: objectiveItemKeys,
            assessmentKeys: assessmentKeys,
            prerequisitesKeys: prerequisitesKeys,
            assessmentTimetableKeys: assessmentTimetableKeys,
            accreditationLength: accreditationLength,
            accreditationOneCriteriaKeys: accreditationOneCriteriaKeys,
            accreditationTwoCriteriaKeys: accreditationTwoCriteriaKeys,

            isAdmin: isUserAdmin
        });
    });
}

/**
 * Gets data from edit-module page form and create a new
 * module object. It then compares the new module object to 
 * previous one (on which the edit was made) and gets the
 * properties which are different. Finally, it creates a
 * submission object with this data and stores it in database.
 */
exports.submitModuleEdit = (req, res, next) => {

    const code = req.body.code;
    const currentVersion = req.body.currentVersion;
    const year = req.body.year;
    const typeOfEdit = req.body.type;
    const note = req.body.note;
    const currentDate = new Date();
    const dateAndTime = currentDate.toDateString() + ' - ' + currentDate.toLocaleTimeString();
    const moduleData = new Module(req.body);

    // if the submission is for new module, then it doesn't need to check for differences.
    if (typeOfEdit === "New") {
        const submission = new Submission(code, currentVersion, year, 'module', typeOfEdit, note, '', JSON.stringify(moduleData), JSON.stringify({}), dateAndTime, null);
        return submission.save('module-submissions').then(() => {
            res.redirect('submissions/module');
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    } 
    else {
        Module.readModuleFromFiles(code, currentVersion, otherModuleData => {       
            // if module is null, render error page.
            if (module === null) {
                const error = new Error();
                error.httpStatusCode = 500;
                return next(error);
            }
            Module.getDifferences(moduleData, otherModuleData, diff => {
                const diffKeys = Object.keys(diff);
                let originalData = {};
                for (let k of diffKeys) {
                    originalData[k] = otherModuleData[k];
                }
                const submission = new Submission(code, currentVersion, year, 'module', typeOfEdit, note, '', JSON.stringify(diff), JSON.stringify(originalData), dateAndTime, null);
                return submission.save('module-submissions').then(() => {
                    res.redirect('submissions/module');
                }).catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            });
        });
    }
}



/**
 * Gets the list of programmes from the database,
 * then renders the modules-programmes-list page.
 * If error, loads the error page.
 */
exports.getProgrammes = (req, res, next) => {
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";

    ProgrammeInfo.getProgrammesInfoList().then(programmes => {
        res.render('staff/modules-programmes-list', {
            dataList: programmes,
            pageType: 'programmes',
            pageTitle: 'All Programmes',
            path: '/programmes',
            isAdmin: isUserAdmin
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Gets the programme code and versions from the HTTP request
 * and loads the programmes data from JSON files. Then renders the 
 * view-module-programme page with the required data provided.
 */
exports.viewProgramme = (req, res, next) => {
    const urlParams = req.params;
    const programmeCode = urlParams['code'];
    const latestVersion = urlParams['latestVersion'];
    const previousVersion = urlParams['previousVersion'];
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";

    ProgrammeInfo.getProgrammeInfoByCode(programmeCode).then(programmeInfo => {
        Programme.readProgrammeFromFiles(programmeCode, latestVersion, p2 => {
            Programme.readProgrammeFromFiles(programmeCode, previousVersion, p1 => {
                // if any of the file is null, meaning an error occurred, then renders the error page.
                if (p1 === null || p2 === null) {
                    const error = new Error();
                    error.httpStatusCode = 500;
                    return next(error);
                } 
                res.render('staff/view-module-programme', {
                    dataInfo: programmeInfo,
                    dataOneVersion: previousVersion,
                    datTwoVersion: latestVersion,
                    dataOne: p1,
                    dataTwo: p2,
                    isData: true,
                    pageType: 'programmes',
                    pageTitle: 'View ' + programmeCode,
                    path: '/programmes',
                    emptyOb: {},
                    isAdmin: isUserAdmin
                });
            });
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Gets the programme code and version from the HTTP request,
 * and reads the programme JSON file. It then renders edit-programme page
 * and supply necessary data. 
 */
exports.editProgramme = (req, res, next) => {

    const urlParams = req.params;
    const code = urlParams['code'];
    const version = urlParams['version'];
    const type = urlParams['type'];
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";

    Programme.readProgrammeFromFiles(code, version, programme => {
        if (programme === null) {
            const error = new Error();
            error.httpStatusCode = 500;
            return next(error);
        } 
        const modulesKeys = Object.keys(programme.modules);
        res.render('staff/edit-programme', {
            modulesKeys: modulesKeys,
            type: type,
            version: version,
            data: programme,
            isData: true,
            pageTitle: 'Edit ' + code,
            path: '/programmes',
            isAdmin: isUserAdmin
        });
    });
}

/**
 * Gets data from edit-programme page form and create a new
 * programme object. It then compares the new programme object to 
 * previous one (on which the edit was made) and gets the
 * properties which are different. Finally, it creates a
 * submission object with this data and stores it in database.
 */
exports.submitProgrammeEdit = (req, res, next) => {

    const code = req.body.code;
    const currentVersion = req.body.currentVersion;
    const year = req.body.year;
    const typeOfEdit = req.body.type;
    const note = req.body.note;
    const currentDate = new Date();
    const dateAndTime = currentDate.toDateString() + ' - ' + currentDate.toLocaleTimeString();
    const programmeData = new Programme(req.body);

    if (typeOfEdit === "New") {
        const submission = new Submission(code, currentVersion, year, 'programme', typeOfEdit, note, '', JSON.stringify(programmeData), JSON.stringify({}), dateAndTime, null);
        submission.save('programme-submissions');
        res.redirect('submissions/programme');
    } else {
        Programme.readProgrammeFromFiles(code, currentVersion, otherProgData => {
            if (otherProgData === null) {
                const error = new Error();
                error.httpStatusCode = 500;
                return next(error);
            } 
            Programme.getDifferences(programmeData, otherProgData, diff => {
                const diffKeys = Object.keys(diff);
                let originalData = {};
                for (let k of diffKeys) {
                    originalData[k] = otherProgData[k];
                }
                const submission = new Submission(code, currentVersion, year, 'programme', typeOfEdit, note, '', JSON.stringify(diff), JSON.stringify(originalData), dateAndTime, null);
                return submission.save('programme-submissions').then(() => {
                    res.redirect('submissions/programme');
                }).catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                });
            });
        });
    }
}

/**
 * Gets the type of submission form the HTTP request.
 * Then gets the modules-submissions list from the database, 
 * if the type is "module", else gets programme-submissions list.
 * Finally, renders the submissions page with appropriate list.
 * If error, loads the error page.
 */
exports.getSubmissions = (req, res, next) => {
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";
    const urlParams = req.params;
    const submissionType = urlParams['type'];
    let collectionName = 'module-submissions';
    if (submissionType != "module") {
        collectionName = 'programme-submissions';
    }
    return Submission.getSubmissionsList(collectionName).then(Submissions => {
        return res.render('staff/submissions', {
            subs: Submissions,
            pageTitle: (submissionType === "module") ? 'Module Submissions' : 'Programme Submissions',
            pageType: submissionType,
            path: (submissionType === 'module') ? '/modSubmissions' : '/progSubmissions',
            isAdmin: isUserAdmin
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

/**
 * Gets the programme code and versions from the http request
 * and loads the programme data from JSON files. Then renders the 
 * view-module-programme page with the required data provided.
 */
exports.viewSubmission = (req, res, next) => {
    const urlParams = req.params;
    const submissionID = urlParams['submissionID'];
    const submissionType = urlParams['type'];
    const isUserAdmin = req.get('Cookie').split('=')[1] === "admin";
    let collectionName = 'module-submissions';
    if (submissionType != "module") {
        collectionName = 'programme-submissions';
    }
    Submission.getSubmissionsById(submissionID, collectionName).then(submission => {
        let canApproveSub = true;
        if (submission.status === "Approved" || submission.status === "Rejected") {
            canApproveSub = false;
        }
        res.render('staff/view-submission', {
            showButtons: canApproveSub,
            submission: submission,
            latestVersion: submission.year,
            previousVersion: submission.currentVersion,
            latestData: JSON.parse(submission.data),
            previousData: JSON.parse(submission.originalData),
            pageTitle: 'View ' + submissionID,
            pageType: submissionType,
            path: (submissionType === "module") ? '/modSubmissions' : '/progSubmissions',
            isAdmin: isUserAdmin
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}