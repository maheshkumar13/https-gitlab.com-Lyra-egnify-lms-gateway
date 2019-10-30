
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const TimeAnalysisSchema = new mongoose.Schema({
  studentId: { type: String },
  studentName: { type: String },
  totalStudents: { type: Number },
  totalTimeSpent: { type: Number },
  isStudent: { type: Boolean },
  subject: {},
  category: {},
  refs: {},
  date: { type: Date },
  active: { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'timeanalysis',
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('TimeAnalysis', TimeAnalysisSchema);
}

export default {
  getModel,
};
