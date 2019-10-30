/**
 @author Mohit Agarwal
 @date    23/08/2019
*/


const express = require('express');

const router = express.Router();
import {convertOldTestToNewFormat , fetchEncryptedQuestions ,fetchDecryptionKey} from './test.upload.controller'
router.get('/questions/:testId' , fetchEncryptedQuestions );
router.get('/convert-old-to-new',convertOldTestToNewFormat);
router.get('/decrypt-key',fetchDecryptionKey);

module.exports = router