import { Router } from 'express';
import * as controller from './user.controller';
import * as auth from '../../../auth/auth.service';

const router = new Router();

// router.get('/', auth.hasRole('admin'), controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/username', auth.isAuthenticated(), controller.changeUsername);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/resetpassword', controller.resetpassword);
router.post('/validateForgotPassSecureHash', controller.validateForgotPassSecureHash);

const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
  },
});
router.post('/upload', multer.single('file'), controller.uploadUsers)
module.exports = router;
