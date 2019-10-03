
const express = require('express');

const router = express.Router();

const controller = require('./datacapture.controller');

router.post('/manualTrigger', controller.manualTrigger);


module.exports = router;
