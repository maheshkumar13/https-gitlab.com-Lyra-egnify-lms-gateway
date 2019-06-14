/**
 *@description
 *    This File contains the Mongoose Schema defined for student
 * @Author :
 *   Aslam Shaik
 * @date
 *    01/03/2018
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const hierarchySchema = new mongoose.Schema({
  child: { type: String },
  childCode: { type: String },
  level: { type: Number },
});

const studentSchema = new mongoose.Schema(
  {
    studentName: { type: String },
    studentId: { type: String },
    egnifyId: { type: String },
    fatherName: { type: String },
    password: { type: Number },
    orientation: { type: String },
    dob: { type: String },
    gender: { type: String },
    category: { type: String },
    hierarchy: { type: [hierarchySchema], required: true },
    hierarchyLevels: {},
    active: { type: Boolean, default: true },
    avatarUrl: { type: String },
    userCreated: { type: Boolean, default: false },
    subjects: {},
  },
  {
    collection: 'studentInfo',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },

  },
);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('Student', studentSchema);
}

export default{
  getModel,
};
// export default mongoose.model('Student', studentSchema);
