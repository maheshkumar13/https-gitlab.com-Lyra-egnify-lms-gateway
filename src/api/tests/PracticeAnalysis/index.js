


/**
 @author Nikhil Kumar
 @date    12/12/2019
*/

const express = require('express');
const router = express.Router();

const controllerUpdatePracticeAnalysis = require('./updatePracticeAnalysis.controller');
// router.post('/updateAnalysis/', controllerUpdatePracticeAnalysis.updatePracticeAnalysis);

const controller = require('./practiceAnalysis.controller');
router.post('/practiceAnalysis/:questionPaperId', controller.getPracticeAnalysis);
module.exports = router;