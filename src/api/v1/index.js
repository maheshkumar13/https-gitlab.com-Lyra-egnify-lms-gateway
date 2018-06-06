/**
 * API
 */
import stream from 'stream';
import _ from 'lodash';
import { config } from '../../config/environment';
import * as authService from '../../auth/auth.service';

const multer = require('multer');
const request = require('request');
const uploadFile = require('./uploadFile');
const user = require('./user');
const auth = require('./../../auth').default;

const { Duplex } = stream;

// const conceptTaxonomy = require('./conceptTaxonomy');
const upload = multer({
  storage: multer.MemoryStorage,
  limits: {
    fileSize: 40 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

<<<<<<< HEAD

=======
function bufferToStream(buffer) {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
}
>>>>>>> f-multi-tenancy
export default function (app) {
  //  Insert API below


  app.use('/api/v1/uploadFile', uploadFile);
  app.use('/api/v1/users', user);
  app.use('/auth', auth);

  // Proxy Request below
<<<<<<< HEAD

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
=======
  app.post(
    '/api/v1/question/populateQuestion',
    authService.isAuthenticated(),
    upload.single('file'),
    (req, res) => {
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
    },
  );


  app.post(
    '/api/v1/student/createBulkStudents',
    authService.isAuthenticated(),
    upload.single('file'),
    (req, res) => {
      const submissionUrl = `${config.services.settings}/api/student/createBulkStudents`;
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
    },
  );
>>>>>>> f-multi-tenancy
}
