import jwt from 'jsonwebtoken';
import User from './user.model';
import { getModel as InstituteHierarchyModel } from '../../settings/instituteHierarchy/instituteHierarchy.model';
import { getModel as StudentInfoModel } from '../../../api/settings/student/student.model';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetchSso';

const bcrypt = require('bcrypt');
const _ = require('lodash');
const xlsx = require('xlsx');

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



async function createOrUpdateUsers(context, data) {
  const url = `${config.services.sso}/api/v1/users/create/usersList`;
  console.log(url)
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({ usersData: data }),
    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
  }, context).then((response) => {
    if (response.status >= 400) {
      return new Error(response.statusText);
    }
    return response.json().then(json => json.status);
  });
}

export async function getClassBranchData(context) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    return InstituteHierarchy.aggregate([
      { $match: { level: 5 } },
      { $project: { branchName: '$child', branchCode: '$childCode', branchLevel: '$level', classData: { $filter: {input: "$anscetors", as: "item", cond: { $eq: [ "$$item.level", 2] }}}}},
      { $unwind: '$classData' },
      { $group: { _id: '$classData.childCode', className: { $first: '$classData.child'}, branches: { $push: { child: '$branchName', childCode: '$branchCode', level: '$branchLevel'}}}}])
  })
}

export async function getListOfOrientations(context) {
  return StudentInfoModel(context).then((StudentInfo) => {
    return StudentInfo.distinct('orientation',{ active: true, orientation: { $nin: ["", null]}})
  })
}

function getClassBranchCombo(obj){
  const classes = obj.classes.split(',').map( x => x.toString().trim())
  const branches = obj.branches.split(',').map( x => x.toString().trim())
  const data = [];
  branches.forEach(branchName => {
    branchName = branchName.replace(/-/g, ' ');
    classes.forEach(className => {
      data.push({ branchName, className })
    })
  })
  return data;
}

function validateEmail(email){
  const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  return tester.test(email);
}


function validateSheetAndGetData(req, classBranchData, dbOrientations) {
  try{
  const result = {
    success: true,
    message: '',
  };

  // validate extension
  const name = req.file.originalname.split('.');
  const extname = name[name.length - 1];
  if (extname !== 'xlsx') {
    result.success = false;
    result.message = 'Invalid extension';
    return result;
  }

  const errors = [];

  // Reading  workbook
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });

  // converting the sheet data to csv
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{defval:""});

  // deleting all trailing empty rows
  for (let i = data.length - 1; i >= 0; i -= 1) {
    let values = Object.values(data[i]);
    values = values.map(x => x.toString());
    // const vals = values.map(x => x.trim());
    if (values.every(x => x === '')) data.pop();
    else break;
  }

  // deleting empty string keys from all objects
	data.forEach((v) => { delete v['']; }); // eslint-disable-line

  // trim and remove whitespace and chaging keys to lower case
  data.forEach((obj) => {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const lowerKey = key.toLowerCase();
      obj[lowerKey] = obj[key].toString().replace(/\s\s+/g, ' ').trim();
      if (key !== lowerKey) delete obj[key];
    }
  });

  const mandetoryFields = [
    'classes', 'branches', 'orientations', 'role', 'email',
  ];
  const headers  = [
    'classes', 'branches', 'orientations', 'role', 'email',
  ]
  if(!data.length) {
    result.success = false;
    result.message = 'Data not found in sheet'
    return result;
  }

  if(data.length > 1000) {
    result.success = false;
    result.message = 'Limit exceeded, maximum 1000 users at a time.'
    return result;
  }
  const sheetHeaders = Object.keys(data[0])

  let diffHeaders = _.difference(headers,sheetHeaders);
  if(diffHeaders.length) {
    result.success = false;
    result.message = `${diffHeaders.toString()} headers not found`
    return result;
  }

  for(let i = 0; i < data.length; i += 1){
    const obj = data[i];
    for (let j = 0; j < mandetoryFields.length; j += 1) {
      if (!obj[mandetoryFields[j]]) {
        result.success = false;
        result.message = `${mandetoryFields[j].toUpperCase()} value not found for row ${i + 2}`;
        return result;
      }
    }
  }

  const finaldata = [];
  for (let i = 0; i < data.length; i += 1) {
    const row = i + 2;
    console.log(`${row}/${data.length}`)
    const obj = data[i];
    
    const classBranchCombo = getClassBranchCombo(obj);
    const hierarchy = [];

    // validating classes and branches
    classBranchCombo.forEach(combo => {
      const classData = classBranchData.find(x => x.className.toLowerCase() === combo.className.toLowerCase())
      if(!classData) {
        // result.success = false;
        // result.message = `Row ${row}, (${combo.className})  class not found`;
        // errors.push(result.message);
      } else {
        const branchData = classData.branches.find( x => x.child.toLowerCase() === combo.branchName.toLowerCase())
        if(!branchData){
          // result.success = false;
          // result.message = `Row ${row}, (${combo.branchName}) branch not found in (${combo.className})`;
          // errors.push(result.message);
        } else hierarchy.push(branchData);
      }
    })

    // validating orientation
    const sheetOrientations = obj.orientations.split(',').map( x => x.toString().trim());
    const orientations = [];
    sheetOrientations.forEach(x => {
      const orientation = dbOrientations.find(y => y.toLowerCase() === x.toLowerCase())
      if(!orientation){
        result.success = false;
        result.message = `Row ${row}, (${x}) orientation not found for any student`;
        errors.push(result.message);
      } else orientations.push(orientation)
    })

    // validating email
    if(!validateEmail(obj.email)){
      result.success = false;
      result.message = `Row ${row}, (${obj.email}) email is invalid`;
      errors.push(result.message);
    }

    // validating roles
    const validRoles = ['TEACHER', 'PRINCIPAL'];
    const role = validRoles.find(x => x.toLowerCase() === obj.role.toLowerCase())
    if(!role){
      result.success = false;
      result.message = `Row ${row}, (${obj.role})  role is invalid, valid roles are ['teacher,principal']`;
      errors.push(result.message);
    }

    if(errors.length >= 1000){
      result.success = false;
      result.message = 'invalid data',
      result.errors = errors;
      result.isArray = true;
      return result;
    }
    let password = '';
    if(obj.password) password = obj.password.toString().padStart(4,'0');

    finaldata.push({
      email: obj.email.toString(),
      userType: role,
      hierarchy,
      orientations,
      password,
    })
  }
  if (errors.length) {
    result.success = false;
    result.message = 'invalid data',
    result.errors = errors;
    result.isArray = true;
    return result;
  }

  req.data = finaldata;
  return result;
  } catch(err) {
    console.log(err);
  }
}


export async function uploadUsers(req, res) {
  if (!req.file) return res.status(400).end('File required');
  const [ classBranchData, dbOrientations ] = await Promise.all([
    getClassBranchData(req.user_cxt),
    getListOfOrientations(req.user_cxt),
  ]).catch(err => {
    console.error(err)
  });  
  const validate = validateSheetAndGetData(req, classBranchData, dbOrientations);
  if (!validate.success) {
    const obj = { message: validate.message };
    if (validate.errors && validate.errors.length) {
      obj.count = validate.errors.length;
      obj.errors = validate.errors;
    }
    res.status(400);
    return res.send(obj);
  }
  const data = req.data;
  return createOrUpdateUsers(req.user_cxt,data).then((doc) => {
    return res.send({status: doc});
  })
  
}
