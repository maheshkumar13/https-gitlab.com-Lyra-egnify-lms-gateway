const express = require('express');
const router = express.Router();

const controller = require('./masterResults.controller');

router.get('/studentList/:paperId', controller.getStudentList);

module.exports = router;
