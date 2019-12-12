


/**
 @author Nikhil Kumar
 @date    12/12/2019
*/

const express = require('express');
const router = express.Router();

const controller = require('./practiceAnalysis.controller');
const controllerUpdatePracticeAnalysis = require('./updatePracticeAnalysis.controller');

router.post('/practiceAnalysis/:questionPaperId', controller.getPracticeAnalysis);
router.post('/updatePracticeAnalysis/', controllerUpdatePracticeAnalysis.updatePracticeAnalysis);
module.exports = router;