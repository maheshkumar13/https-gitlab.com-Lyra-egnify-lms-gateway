const express = require('express');

const router = express.Router();

import { student } from '../v1/studentSync/studentSync.controller';
import { createHierarchy } from '../v1/hierarchySync/hierarchySync.controller'; 

router.post('/student/create', student);
router.post('/hierarchy/create', createHierarchy);

module.exports = router;