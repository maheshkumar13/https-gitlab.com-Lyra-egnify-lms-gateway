const express = require('express');
const router = express.Router();

const controller = require('./student.controller');

const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  // limits: {
  //   fileSize: 5 * 1024 * 1024, // no larger than 5mb
  // },
});

router.post(
    '/updateUserv1', 
    multer.single('file'), 
    controller.updateUserV1
);

module.exports = router;