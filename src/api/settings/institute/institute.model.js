import { getDB } from '../../../db';

const mongoose = require('mongoose');

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const InstituteSchema = new mongoose.Schema({
  instituteId: { type: String },
  ownerName: { type: String },
  email: {
    type: String,
    validate: {
      validator: function(v) { // eslint-disable-line
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
        return re.test(v.toLowerCase());
      },
      message: '{VALUE} is not a valid email!',
    },
  },
  phone: { type: Number },
  __subdomain: { type: String, unique: true, required: true },
  url: { type: String },
  instituteName: {
    type: String,
    maxlength: [50, 'Institute Name Id cannot be more than 50 charechters'],
  },
  registrationId: {
    type: String,
    maxlength: [50, 'Registration Id cannot be more than 50 charechters'],
  },
  logoUrl: {
    type: String,
    validate: {
      validator(v) {
        const urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi; // eslint-disable-line
        return urlExpression.test(v);
      },
      message: 'Invalid Logo',
    },
  },
  proofOfRegistrationUrl: {
    type: String,
    validate: {
      validator(v) {
          const urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi; // eslint-disable-line
        return urlExpression.test(v);
      },
      message: 'Invalid Proof Of Registration',
    },
  },
  proofOfRegistrationUrlFileName: { type: String },
  googleTrackingId: { type: String },
  establishmentYear: { type: Number, min: 1000, max: [currentYear, 'Establishment Year cannot be in the future'] },
  registrationStatus: { type: Boolean },
  hierarchy: [],
  academicSchedule: {},
  otpUrl: { type: String },
  active: { type: Boolean, default: true },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});


export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('Institute', InstituteSchema);
}

export default {
  getModel,
};
