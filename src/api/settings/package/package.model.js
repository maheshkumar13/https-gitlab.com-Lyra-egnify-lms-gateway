import { getDB } from '../../../db';

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: { type: String },
  textbookCodes: { type: [String] },
});

const PackageSchema = new mongoose.Schema({
  packageName: { type: String },
  packageId: { type: String },
  academicYear: { type: String },
  classCode: { type: String },
  subjects: { type: [subjectSchema] },
  orientations: { type: [String] },
  branches: { type: [String] },
  studentIds: { type: [String], default: null },
  active: { type: Boolean, default: true },
  status: { type: String, enum: ['underReview', 'underFeedback', 'approved','published'], default: 'underReview' },
  reviewedBy: { type: String },
  authoredBy: { type: String },
  feedback: { type:String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('Package', PackageSchema);
}

export default {
  getModel,
};
