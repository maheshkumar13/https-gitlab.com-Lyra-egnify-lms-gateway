/**
 @author Aakash Parsi
 @date    18/04/2019
*/

const express = require('express');

const router = express.Router();

const controller = require('./instituteHierarchy.controller');

const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

router.post('/downloadSampleForCategory', controller.downloadSampleForCategory)
router.post('/uploadCategory',  multer.single('file'), controller.uploadCategory)

module.exports = router;
