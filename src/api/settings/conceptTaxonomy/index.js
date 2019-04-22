

/**
 @author Aslam Shaik
 @date    23/01/2018
*/


const express = require('express');

const router = express.Router();

const controller = require('./concpetTaxonomy.controller');
const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});

router.post(
    '/createConceptTaxonomy', multer.single('file'),
    controller.createConceptTaxonomy,
  );

router.post(
'/downloadSample', multer.single('file'),
controller.downloadSample,
);

module.exports = router