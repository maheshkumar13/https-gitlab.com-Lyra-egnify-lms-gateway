import request from 'request';
import { config } from '../../../config/environment';

export function testResultsReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
  const { body } = req;
  const formData = {};
  _.forEach(body, (value, key) => {
    formData[key] = JSON.stringify(value);
  });
  formData.user = JSON.stringify(req.user);
  if (req.file) {
    formData.file = {
      value: bufferToStream(req.file.buffer),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      },
    };
  }

  request.post(submissionUrl, { formData }).pipe(res);
}
export function studentResponseReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
  const { body } = req;
  const formData = {};
  _.forEach(body, (value, key) => {
    formData[key] = JSON.stringify(value);
  });
  formData.user = JSON.stringify(req.user);
  if (req.file) {
    formData.file = {
      value: bufferToStream(req.file.buffer),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      },
    };
  }

  request.post(submissionUrl, { formData }).pipe(res);
}
export function cwuAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
  const { body } = req;
  const formData = {};
  _.forEach(body, (value, key) => {
    formData[key] = JSON.stringify(value);
  });
  formData.user = JSON.stringify(req.user);
  if (req.file) {
    formData.file = {
      value: bufferToStream(req.file.buffer),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      },
    };
  }

  request.post(submissionUrl, { formData }).pipe(res);
}
export function markDistributionReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
  const { body } = req;
  const formData = {};
  _.forEach(body, (value, key) => {
    formData[key] = JSON.stringify(value);
  });
  formData.user = JSON.stringify(req.user);
  if (req.file) {
    formData.file = {
      value: bufferToStream(req.file.buffer),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      },
    };
  }

  request.post(submissionUrl, { formData }).pipe(res);
}
export function errorCountReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
  const { body } = req;
  const formData = {};
  _.forEach(body, (value, key) => {
    formData[key] = JSON.stringify(value);
  });
  formData.user = JSON.stringify(req.user);
  if (req.file) {
    formData.file = {
      value: bufferToStream(req.file.buffer),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      },
    };
  }

  request.post(submissionUrl, { formData }).pipe(res);
}
export function studentPerformanceTrendReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
  const { body } = req;
  const formData = {};
  _.forEach(body, (value, key) => {
    formData[key] = JSON.stringify(value);
  });
  formData.user = JSON.stringify(req.user);
  if (req.file) {
    formData.file = {
      value: bufferToStream(req.file.buffer),
      options: {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      },
    };
  }

  request.post(submissionUrl, { formData }).pipe(res);
}

export default {

  testResultsReport,
  studentResponseReport,
  cwuAnalysisReport,
  markDistributionReport,
  errorCountReport,
  studentPerformanceTrendReport,

};
