/**
 @author KSSR.
 @date    XX/XX/2018
 @version 0.1.0
*/
import * as authService from '../../../auth/auth.service';

const express = require('express');

const controller = require('./downloadReports.controller');

const router = express.Router();

router.post('/testResultsReport', authService.isAuthenticated(), controller.testResultsReport);
router.post('/studentResponseReport', authService.isAuthenticated(), controller.studentResponseReport);
router.post('/cwuAnalysisReport', authService.isAuthenticated(), controller.cwuAnalysisReport);
router.post('/studentPerformanceTrendReport', authService.isAuthenticated(), controller.studentPerformanceTrendReport);
router.post('/studentMarksAnalysisReport', authService.isAuthenticated(), controller.studentMarksAnalysisReport);
router.post('/studentComparisionTrendReport', authService.isAuthenticated(), controller.studentComparisionTrendReport);
router.post('/weakSubjectReport', authService.isAuthenticated(), controller.weakSubjectReport);
// router.post('/markDistributionReport', controller.markDistributionReport);
// router.post('/errorCountReport', controller.errorCountReport);

module.exports = router;
