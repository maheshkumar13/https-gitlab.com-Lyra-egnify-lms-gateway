/**
 *@description
 *    This File contains the Mongoose Schema defined for masterBookRecord
 * @author
 *   Parsi
 * @date
 *    XX/XX/2018
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';
import { config } from '../../../config/environment';

const contextPlugin = require('../../../db/contextPlugin');
const { getContextPluginConfig } = require('../../../db/contextPlugin/config');

const ResponseDataSchema = new mongoose.Schema({
  evaluation: Object,
  score: Object,
  response: Object,
});

const CWUAnalysisType = new mongoose.Schema({
  C: { type: Number },
  W: { type: Number },
  U: { type: Number },
});

const MasterResultSchema = new mongoose.Schema(
  {
    // test data
    questionPaperId: { type: String, required: true },
    // student data
    studentId: { type: String, required: true },
    studentName: { type: String },

    // response data
    responseData: ResponseDataSchema,
    active: { type: Boolean, default: true },

    // Analysis data
    cwuAnalysis: { type: CWUAnalysisType },
    obtainedMarks: { type: Number },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('MasterResult', MasterResultSchema);
}

export default {
  getModel,
};
