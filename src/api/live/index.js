const express = require('express');
const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
})

const router = express.Router();

const controller = require('./class.controller');

router.post('/', controller.createClass);
router.get('/:classId',controller.getClass);
router.get('/',controller.getClassesByStatus)



module.exports = router;