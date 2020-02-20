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
});

const QuestionSchema = new mongoose.Schema({
  questionPaperId: { type: String },
  question: { type: String },
  errors: { type: Array, default: []},
  qno: { type: String },
  isGlobalErroneous: { type: Boolean },
  options: { type: [optionsSchema] },
  q_type: { type: String },
  q_category: { type: String },
  key: { type: [String] },
  difficulty: { type: String },
  revised_blooms_taxonomy: { type: String },
  questionTypeMetaData: {},
  hint: { type: String },
  skill: { type: String },
  solution: { type: String },
  xml_id: { type: Number },
  questionNumberId: { type: String},
  subject: { type: String},
  optionHash: { type: String},
  questionHash: { type: String},
  keyHash: { type: String},
  C: { type: Number, default: null},
  warnings: { type : [String], default: []},
  table_no: { type: Number, default: null},
  concept_name: { type: String,default: null}
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
