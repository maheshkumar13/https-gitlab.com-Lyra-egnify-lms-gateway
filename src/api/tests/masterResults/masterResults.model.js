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

const MasterResult = new mongoose.Schema(
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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export async function getModel(userCxt) {
  // getting user context
  const { instituteId } = userCxt;
  const { roleName } = userCxt.access;
  const contextConfig = getContextPluginConfig();
  contextConfig.tenantIdType = String;
  let context = userCxt.access.hierarchy;

  if (roleName.includes(config.userRoles.studentRole)) {
    contextConfig.tenantIdKey = 'accessTag.student';
    context = [];
    context.push(userCxt.username);
  }
  MasterResult.plugin(contextPlugin, contextConfig);


  // initiating the model
  const db = await getDB(instituteId, userCxt);
  const Model = db.model('MasterResult', MasterResult);
  return Model.getModelWithContext(context, instituteId);
}

export default {
  getModel,
};
