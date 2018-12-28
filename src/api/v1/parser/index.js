import { Router } from 'express';
import * as controller from './parser.controller';
import * as auth from '../../../auth/auth.service';

const multer = require('multer');

const router = new Router();

const upload = multer({
  storage: multer.MemoryStorage,
  limits: {
    fileSize: 40 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});
// |============================================================|
// |======================== PARSER API ========================|
// |============================================================|

router.post('/get_csv', upload.single('file'), auth.isAuthenticated(), controller.getCsv);

const datUploadType = upload.fields([{ name: 'datfile' }, { name: 'datfilekey' }]);
router.post('/dat_converter', auth.isAuthenticated(), datUploadType, controller.datConverter);

const iitUploadType = upload.fields([{ name: 'file' }, { name: 'key' }]);
router.post('/iit_converter', auth.isAuthenticated(), iitUploadType, controller.iitConverter);

module.exports = router;
