const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// Defining the routes for the admin. 
// Then calling appropriate function from the admin controller. 
router.post('/approve-submission/:submissionID/:type', adminController.postApproveSubmission);
router.post('/reject-submission/:submissionID/:type', adminController.postRejectSubmission);
router.post('/delete-submission/:submissionID/:type', adminController.postDeleteSubmission);

router.get('/approved/:type', adminController.getApprovedSubmissions);
router.post('/delete-approved/:approvedID/:type', adminController.postDeleteApproved);
router.post('/generate-new-module-file/:approvedID/:type', adminController.generateNewModuleFile);
router.post('/generate-updated-module-file/:approvedID/:type', adminController.generateUpdatedModuleFile);
router.post('/generate-new-programme-file/:approvedID/:type', adminController.generateNewProgrammeFile);
router.post('/generate-updated-programme-file/:approvedID/:type', adminController.generateUpdatedProgrammeFile);

module.exports = router;