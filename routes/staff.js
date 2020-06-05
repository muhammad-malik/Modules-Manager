const express = require('express');

const staffController = require('../controllers/staff');

const router = express.Router();

// Defining the routes for the user type "Staff". 
// Then calling appropriate function from the staff controller. 
// Admins also have access to these routes/functions.
router.get('/', staffController.getIndex);
router.get('/modules', staffController.getModules);
router.get('/view/modules/:code/:latestVersion/:previousVersion', staffController.viewModule);
router.get('/edit/modules/:code/:version/:type', staffController.editModule);
router.post('/edit-module', staffController.submitModuleEdit);

router.get('/programmes', staffController.getProgrammes);
router.get('/view/programmes/:code/:latestVersion/:previousVersion', staffController.viewProgramme);
router.get('/edit/programmes/:code/:version/:type', staffController.editProgramme);
router.post('/edit-programme', staffController.submitProgrammeEdit);

router.get('/submissions/:type', staffController.getSubmissions);
router.get('/view/submissions/:submissionID/:type', staffController.viewSubmission);


module.exports = router;