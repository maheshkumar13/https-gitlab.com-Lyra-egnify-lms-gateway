
const express = require('express');

const router = express.Router();

const controller = require('./timeAnalysis.controller');

router.post('/manualTrigger', controller.manualTrigger);


module.exports = router;
