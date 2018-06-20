/**
 @author Gaurav Chauhan.
 @date    XX/XX/2018
 @version 0.1.0
*/
import * as authService from '../../../auth/auth.service';


const express = require('express');

const controller = require('./authValidation.controller');

const router = express.Router();

router.post(
  '/',
  authService.isAuthenticated(),
  controller.authValidation,
);
module.exports = router;
