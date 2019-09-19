/**
 @author Mohit Agarwal
 @date    23/08/2019
*/


const express = require('express');

const router = express.Router();
import {convertOldTestToNewFormat , fetchEncryptedQuestions } from './test.upload.controller'
router.get('/questions/:testId' , fetchEncryptedQuestions );
router.get('/convert-old-to-new',convertOldTestToNewFormat);

module.exports = router