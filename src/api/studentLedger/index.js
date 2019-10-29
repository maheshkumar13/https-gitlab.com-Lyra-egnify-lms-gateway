


/**
 @author Nikhil Kumar
 @date    23/01/2018
*/
const express = require('express');
const router = express.Router();

const controller = require('./studentLedger.controller');

router.post('/Credit/:AssetId', controller.CreditCoin);
router.post('/Debit/:AssetId', controller.DebitCoin);
router.post('/coinLog',  controller.StudentCoinLog);

module.exports = router;