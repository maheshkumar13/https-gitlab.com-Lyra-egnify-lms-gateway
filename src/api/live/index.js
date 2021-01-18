const express = require('express');
const router = express.Router();

const controller = require('./class.controller');

router.post('/', controller.createClass);
router.get('/:classId',controller.getClass);
router.get('/',controller.getClassesByStatus)



module.exports = router;