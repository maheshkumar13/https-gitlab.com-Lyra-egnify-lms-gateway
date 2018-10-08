
import { Router } from 'express';
import * as controller from './converter.controller';
import * as auth from '../../../auth/auth.service';


const multer = require('multer');

const upload = multer({
  storage: multer.MemoryStorage,
  limits: {
    fileSize: 40 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});
const router = new Router();


router.post('/', auth.isAuthenticated(), upload.fields([{ name: 'file' }, { name: 'key' }]), controller.convertData);

module.exports = router;
