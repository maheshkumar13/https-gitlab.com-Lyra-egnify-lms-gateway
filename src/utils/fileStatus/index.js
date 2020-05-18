
const express = require('express');

const router = express.Router();

const controller = require('./fileStatus.controller');

router.get('/:fileStatusId', controller.getFileStatus);

module.exports = router;

