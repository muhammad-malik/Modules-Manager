const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

// For changing the type of user.
router.get('/change-user/:userType', userController.switchUser);

module.exports = router;