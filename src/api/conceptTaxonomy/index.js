// const express = require('express');
//
// const controller = require('./conceptTaxonomy.controller');
//
// const router = express.Router();
// const multer = require('multer');
//
// const upload = multer({
//   storage: multer.MemoryStorage,
//   limits: {
//     fileSize: 40 * 1024 * 1024, // no larger than 5mb, you can change as needed.
//   },
// });
//
// router.post(
//   '/get/conceptTaxonomyfromCSV',
//   upload.array('files', 1),
//   controller.generateTaxonomyFromCSV,
// );
//
// module.exports = router;
