import express from 'express';
import request from 'request';

import passport from 'passport';
import { signToken, isAuthenticated } from '../auth.service';
import { config } from '../../config/environment';

const router = express.Router();

// router.post('/', (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     const error = err || info;
//     if (error) {

//       return res.status(401).json(error);
//     }
//     if (!user) {
//       return res.status(404).json({ message: 'Something went wrong, please try again.' });
//     }
//     console.log(user);
//     const token = signToken(user._id, user.role, user.instituteId, user.hostname);
//     res.json({ token, firstTimePasswordChanged: user.passwordChange });
//   })(req, res, next);
// });

// router.post(
//   '/refreshtoken',
//   isAuthenticated(),
//   (req, res) => {
//     const { user } = req;
//     const token = signToken(user._id, user.role, user.instituteId, user.hostname);
//     res.json({ token, firstTimePasswordChanged: user.passwordChange });
//   },
// );

router.post('/', (req, res) => {
  const authService = `${config.services.sso}/auth/local`;
  request.post(authService, { form: req.body }).pipe(res);
});

router.post('/refreshtoken', (req, res) => {
  const authService = `${config.services.sso}/auth/local/refreshtoken`;
  request.post(authService, { form: req.body }).pipe(res);
});

export default router;
