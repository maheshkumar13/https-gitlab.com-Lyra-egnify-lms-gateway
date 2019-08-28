/**
 @author Mohit Agarwal
 @date    23/08/2019
*/


const express = require('express');

const router = express.Router();
import {convertOldTestToNewFormat} from './test.upload.controller'

router.get('/convert-old-to-new',convertOldTestToNewFormat);

module.exports = router