/**
 *@description
 *    This File contains the Mongoose Schema defined for subjectTaxonomy
 * @Author :
 *   Aslam Shaik
 * @date
 *    27/12/2018
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const subSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true }
})

const nameCodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }
})

const refsSchema = new mongoose.Schema({
  board: { type: nameCodeSchema, required: true },
  class: { type: nameCodeSchema, required: true },
  subjecttype: { type: nameCodeSchema, required: true }, 
})

const SubjectSchema = new mongoose.Schema({
  subject: { type: String, required: true, description: 'Name of the subject' },
  code: { type: String, required: true, description: 'Internal code for the subject' },
  subsubjects: [subSubjectSchema],
  refs: { type: refsSchema, required: true, description: 'Reference data for subject' },
  active: { type: Boolean, default: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('SubjectSchema', SubjectSchema);
}
export default {
  getModel,
};
