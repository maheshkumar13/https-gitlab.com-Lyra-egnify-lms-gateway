

/**
 @author Aslam Shaik
 @date    23/01/2018
*/


const express = require('express');

const router = express.Router();

const controller = require('./contentMapping.controller');

const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

router.post('/downloadContentDetails', controller.downloadContentDetails)
router.post('/upload', multer.single('file'), controller.uploadContentMappingv2)
router.post('/uploadReadingMaterialAudioMapping', multer.single('file'), controller.uploadReadingMaterialAudioMapping)
router.post('/publish-practice/:assetId', controller.publishPractice);

module.exports = router