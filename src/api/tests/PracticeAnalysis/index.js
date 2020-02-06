


/**
 @author Nikhil Kumar
 @date    12/12/2019
*/

const express = require('express');
const router = express.Router();

const controller = require('./practiceAnalysis.controller');
router.post('/practiceAnalysis/:questionPaperId', controller.getPracticeAnalysis);
router.get('/student-practice-stats',controller.getStudentWisePracticeStats);
module.exports = router;