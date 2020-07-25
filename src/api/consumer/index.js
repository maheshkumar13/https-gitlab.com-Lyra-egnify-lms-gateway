const express = require('express');

const router = express.Router();

import { student } from '../v1/studentSync/studentSync.controller';

router.post('/student/create', student);

module.exports = router;