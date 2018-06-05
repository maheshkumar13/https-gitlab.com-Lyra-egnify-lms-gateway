/**
 * API
 */

import { config } from '../../config/environment';
import * as authService from '../../auth/auth.service';

const multer = require('multer');
const request = require('request');
const uploadFile = require('./uploadFile');
const user = require('./user');
const auth = require('./../../auth').default;
// const conceptTaxonomy = require('./conceptTaxonomy');
const upload = multer({
  storage: multer.MemoryStorage,
  limits: {
    fileSize: 40 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

export default function (app) {
  //  Insert API below
  app.use('/api/v1/uploadFile', uploadFile);
  app.use('/api/v1/users', user);
  app.use('/auth', auth);

  // Proxy Request below
  app.post(
    '/api/v1/question/populateQuestion',
    authService.isAuthenticated(),
    upload.single('file'),
    (req, res) => {
      const submissionUrl = `${config.services.test}/api/v1/question/populateQuestion`;
      const userContext = req.user._doc;
      const { file } = req;

      const { question_reg } = req.body;
      const { option_reg } = req.body;
      const { subjects } = req.body;
      const { no_of_questions } = req.body;
      const { testId } = req.body;

      request.post(submissionUrl, {
        form: {
          user: userContext,
          file,
          question_reg,
          option_reg,
          subjects,
          no_of_questions,
          testId,
        },
      }).pipe(res);
    },
  );


  app.post('/api/student/createBulkStudents', authService.isAuthenticated(), (req, res) => {
    const submissionUrl = `${config.services.settings}/api/student/createBulkStudents`;
    const submissionRequest = request(submissionUrl);
    req.pipe(submissionRequest).pipe(res);
  });
}
