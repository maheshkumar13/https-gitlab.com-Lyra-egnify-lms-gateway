import jwt from 'jsonwebtoken';
import User from './user.model';
import { config } from '../../../config/environment';

const bcrypt = require('bcrypt');

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    return res.status(statusCode).send(err);
  };
}

// function to reset password using forgethashtoken and new password
export async function resetpassword(req, res) {
  const hashToken = req.body.hashToken;
  const newPassword = req.body.password;
  if (hashToken && newPassword) {
    return User.findOne({
      forgotPassSecureHash: hashToken,
    })
      .then((user) => {
        if (Date.now() <= user.forgotPassSecureHashExp) {
          user.password = newPassword;
          user.forgotPassSecureHash = '';
          return user.save()
            .then(() => {
              res.status(200).end();
            })
            .catch(validationError(res));
        }

        return res.status(403).send('Link Expired');
      })
      .catch(() => {
        res.status(403).end();
      });
  }

  res.status(403).send('Invalid Parameter');
}

// function to validate forgethashtoken
export async function validateForgotPassSecureHash(req, res) {
  const { hashToken } = req.body;
  if (hashToken) {
    return User.findOne({
      forgotPassSecureHash: hashToken,
    })
      .then((user) => {
        if (user) {
          if (Date.now() <= user.forgotPassSecureHashExp) {
            return res.status(200).json({ msg: 'Link Valid', isValid: true });
          }
          return res.status(403).json({ msg: 'Link Expired', isValid: false });
        }
        return res.status(403).json({ msg: 'Not a Valid Hash', isValid: false });
      })
      .catch((err) => {
        res.status(403).json({ msg: err, isValid: false });
      });
  }

  return res.status(403).json({ msg: 'Invalid Arguments', isValid: false });
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  const newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then((user) => {
      const token = jwt.sign({ _id: user._id, instituteId: user.instituteId, hostname: user.hostname }, config.secrets.session, {
        expiresIn: 60 * 60 * 5,
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  const userId = req.params.id;

  return User.findById(userId).exec()
    .then((user) => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(() => {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users Name
 */
export function changeUsername(req, res) {
  const userId = req.user._id;
  const { userName } = req.body;

  if (userName) {
    return User.findById(userId).exec()
      .then((user) => {
        if (user) {
          user.name = userName;
          return user.save()
            .then(() => {
              res.status(204).end();
            })
            .catch(validationError(res));
        }
        return res.status(403).end();
      });
  }
  res.statusMessage = 'No UserName in Request Parameter';
  return res.status(404).end();
}
/**
 * Change a users password
 */
export function changePassword(req, res) {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then((user) => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        if (!user.passwordChange) {
          user.passwordChange = true;
        }
        return user.save()
          .then(() => {
            res.status(200).end();
          })
          .catch(validationError(res));
      }
      res.statusMessage = 'Current password does not match';
      return res.status(403).send('Current password does not match');
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  const userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then((user) => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      user.role = req.user.access.roleName.join(',');
      return res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
