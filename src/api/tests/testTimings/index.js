


/**
 @author Nikhil Kumar
 @date    02/01/2020
*/

const express = require('express');
const router = express.Router();

const controller = require('./testTimings.controller.js');
router.get('/testTimings/?', controller.getTestTimings);
module.exports = router;