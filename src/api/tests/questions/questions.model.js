/**
 *@description
 *    This File contains the Mongoose Schema defined for Questions
 * @Author :
 *   Aslam Shaik
 * @date
 *    27/12/2018
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const optionsSchema = new mongoose.Schema({
  optionText: { type: String },
  option: { type: String },
  error: {},
  comment: { type: String }
})

const QuestionSchema = new mongoose.Schema({
  questionPaperId: { type: String },
  question: { type: String },
  error: {},
  qno: { type: String },
  isGlobalErroneous: { type: Boolean },
  options: { type: [optionsSchema] },
  C: { type: Number },
  W: { type: Number },
  U: { type: Number },
  P: { type: Number },
  ADD: { type: Number, default: 0 },
  q_type: { type: String },
  q_category: { type: String },
  key: { type: [String] },
  difficulty: { type: String },
  revised_blooms_taxonomy: { type: String },
  questionTypeMetaData: {},
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('Question', QuestionSchema);
}

export default {
  getModel,
};
