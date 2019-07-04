/**
 @author KSSR.
 @date    XX/XX/2018
 @version 0.1.0
*/
import * as authService from '../../../auth/auth.service';

const express = require('express');

const controller = require('./downloadReports.controller');

const router = express.Router();

const Multer = require('multer');

router.post('/testResultsReport', authService.isAuthenticated(), controller.testResultsReport);
router.post('/studentResponseReport', authService.isAuthenticated(), controller.studentResponseReport);
router.post('/studentErrorReport', authService.isAuthenticated(), controller.studentErrorReport);
router.post('/cwuAnalysisReport', authService.isAuthenticated(), controller.cwuAnalysisReport);
router.post('/studentPerformanceTrendReport', authService.isAuthenticated(), controller.studentPerformanceTrendReport);
router.post('/studentPreviousAndPresentTestReport', authService.isAuthenticated(), controller.studentPreviousAndPresentTestReport);
router.post('/studentMarksAnalysisReport', authService.isAuthenticated(), controller.studentMarksAnalysisReport);
router.post('/studentComparisionTrendReport', authService.isAuthenticated(), controller.studentComparisionTrendReport);
router.post('/testVsEstimatedAveragesReport', authService.isAuthenticated(), controller.testVsEstimatedAveragesReport);
router.post('/weakSubjectReport', authService.isAuthenticated(), controller.weakSubjectReport);
router.post('/download/allStudentConceptAnalysis', authService.isAuthenticated(), controller.allstudentConceptAnalysisReport);
router.post('/download/allTestAverageAnalysisReport', authService.isAuthenticated(), controller.allTestAverageAnalysisReport);
// router.post('/markDistributionReport', controller.markDistributionReport);
// router.post('/errorCountReport', controller.errorCountReport);
router.post('/download/downloadContentMappingSample', authService.isAuthenticated(), controller.downloadContentMappingSample);

const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
});

router.post(
    '/upload/uploadContentMappingSample', multer.single('file'),
    controller.uploadedContentMapping,
);

module.exports = router;
