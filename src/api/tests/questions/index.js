

/**
 @author Aslam Shaik
 @date    23/01/2018
*/
const express = require('express');
const router = express.Router();
const Multer = require('multer');
const controller = require('./questions.controller');
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});
router.post('/upload', multer.single('file'), controller.practiceParseAndValidate);
router.post('/parser-status',controller.parserStatus);
router.post('/publish', controller.publishPractice);
router.post('/parse-file',multer.single('file'), controller.parseQuestionPaper);

module.exports = router