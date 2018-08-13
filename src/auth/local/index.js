import express from 'express';
import passport from 'passport';
import { signToken, isAuthenticated } from '../auth.service';

const router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    const error = err || info;
    if (error) {

      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({ message: 'Something went wrong, please try again.' });
    }
    console.log(user);
    const token = signToken(user._id, user.role, user.instituteId, user.hostname);
    res.json({ token, firstTimePasswordChanged: user.passwordChange });
  })(req, res, next);
});
router.post(
  '/refreshtoken',
  isAuthenticated(),
  (req, res) => {
    const { user } = req;
    const token = signToken(user._id, user.role, user.instituteId, user.hostname);
    res.json({ token, firstTimePasswordChanged: user.passwordChange });
  },
);

export default router;
