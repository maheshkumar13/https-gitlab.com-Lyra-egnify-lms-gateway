import _ from 'lodash';

import { config } from '../../../config/environment';

const request = require('request');

// function to download testResultsReport
export function testResultsReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/testResultsReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentResponseReport
export function studentResponseReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentResponseReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}
// function to download cwuAnalysisReport

export function cwuAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/cwuAnalysisReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentPerformanceTrendReport

export function studentPerformanceTrendReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/reports/download/studentPerformanceTrendReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

export async function studentComparisionTrendReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentComparisionTrendReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download weakSubjectReport
export async function weakSubjectReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/weakSubjectReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;
  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentMarksAnalysisReport
export function studentMarksAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentMarksAnalysisReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

export default {
  studentResponseReport,
  cwuAnalysisReport,
  studentComparisionTrendReport,
  weakSubjectReport,
};
