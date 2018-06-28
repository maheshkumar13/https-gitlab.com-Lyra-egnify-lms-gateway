import _ from 'lodash';

import { config } from '../../../config/environment';

const request = require('request');

export function studentResponseReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentResponseReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;
  console.info(form);

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);

  // request.post(submissionUrl, { form }).pipe(res);
}

export default {


  studentResponseReport,

};
