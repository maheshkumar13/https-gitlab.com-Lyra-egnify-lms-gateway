/**
 @author Mohit Agarwal
 @date    23/08/2019
*/


const express = require('express');
const router = express.Router();
const Multer = require('multer');

const controller = require('./test.upload.controller');
const timingController = require('../testTiming/testtiming.controller');
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // no larger than 5mb
    },
  });

router.post('/upload-mapping', multer.single('file'), controller.uploadTestMapping)
router.post('/upload-timing/:testId',multer.single('file'), controller.uploadTestiming)
router.get('/testtiming/:testId', timingController.getTestTiming);
router.post('/publish-test', controller.publishTest);
module.exports = router