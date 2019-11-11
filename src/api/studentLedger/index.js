


/**
 @author Nikhil Kumar
 @date    23/01/2018
*/

const express = require('express');
const router = express.Router();

const controller = require('./studentLedger.controller');

router.post('/credit/:assetId', controller.creditCoin);
router.post('/debit/:assetId', controller.debitCoin);
router.post('/coinLog',  controller.studentCoinLog);
router.post('/finalBalance',  controller.finalBalance);

module.exports = router;