


/**
 @author Nikhil Kumar
 @date    12/12/2019
*/

const express = require('express');
const router = express.Router();

const controller = require('./getAnalysis.controller');

router.post('/getAnalysis/:questionPaperId', controller.getAnalysis);
module.exports = router;