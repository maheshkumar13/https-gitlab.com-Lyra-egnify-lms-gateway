/**
 @author KSSR.
 @date    XX/XX/2018
 @version 0.1.0
*/
const express = require('express');

const fileUpload = require('../../../utils/fileUpload');
const controller = require('./downloadReports.controller');

const router = express.Router();

router.post('/testResultsReport', controller.testResultsReport);
router.post('/studentResponseReport', controller.studentResponseReport);
router.post('/cwuAnalysisReport', controller.cwuAnalysisReport);
router.post('/markDistributionReport', controller.markDistributionReport);
router.post('/errorCountReport', controller.errorCountReport);
router.post('/studentPerformanceTrendReport', controller.studentPerformanceTrendReport);

module.exports = router;
