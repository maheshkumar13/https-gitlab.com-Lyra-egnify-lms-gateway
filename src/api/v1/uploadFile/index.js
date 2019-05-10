/**
 @author Rahul Islam.
 @date    XX/XX/2018
 @version 0.1.0
*/
const express = require('express');

const fileUpload = require('../../../utils/fileUpload');
const controller = require('./uploadFile.controller');

const router = express.Router();

router.post(
  '/',
  fileUpload.multer.single('file'),
  fileUpload.sendUploadToGCS,
  controller.index,
);

router.post(
  '/public/aws',
  fileUpload.multer.single('file'),
  fileUpload.AWSPublicFileUpload,
);

router.post(
  '/private/aws',
  fileUpload.multer.array('file'),
  fileUpload.AWSPrivateFileUpload,
);

module.exports = router;
