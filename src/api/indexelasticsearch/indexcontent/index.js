const express = require('express');

const router = express.Router();

import { indexChapter , indexContent } from './indexcontent.controller';

router.get("/index-content" , indexContent);
router.get("/index-chapter" , indexChapter);

module.exports = router;