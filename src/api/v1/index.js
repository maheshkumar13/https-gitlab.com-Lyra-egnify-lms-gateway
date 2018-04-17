/**
 * API
 */

import { config } from '../../config/environment';
import * as authService from '../../auth/auth.service';

const request = require('request');
const uploadFile = require('./uploadFile');
const user = require('./user');
const auth = require('./../../auth').default;
// const conceptTaxonomy = require('./conceptTaxonomy');

export default function (app) {
  //  Insert API below
  app.use('/api/v1/uploadFile', uploadFile);
  app.use('/api/v1/users', user);
  app.use('/auth', auth);

  // Proxy Request below
  app.post('/api/v1/question/populateQuestion', authService.isAuthenticated(), (req, res) => request({
    url: `${config.services.test}/api/v1/question/populateQuestion`,
    method: 'POST',
  }).pipe(res));
}
