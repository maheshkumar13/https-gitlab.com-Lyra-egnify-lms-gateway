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

  app.post('/api/v1/question/populateQuestion', authService.isAuthenticated(), (req, res) => {
    const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
    const submissionRequest = request(submissionUrl);
    req.pipe(submissionRequest).pipe(res);
  });

  app.post('/api/v1/student/createBulkStudents', authService.isAuthenticated(), (req, res) => {
    const submissionUrl = `${config.services.settings}/api/student/createBulkStudents`;
    const submissionRequest = request(submissionUrl);
    req.pipe(submissionRequest).pipe(res);
  });
}
