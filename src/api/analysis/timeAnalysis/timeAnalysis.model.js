
import mongoose from 'mongoose';
import { getDB } from '../../../db';
import { fetchNodesWithContext } from '../../../api/settings/instituteHierarchy/instituteHierarchy.controller';

const TimeAnalysisSchema = new mongoose.Schema({
  studentId: { type: String, index: true },
  studentName: { type: String },
  totalStudents: { type: Number },
  totalTimeSpent: { type: Number },
  isStudent: { type: Boolean },
  subject: {},
  category: {},
  refs: {},
  date: { type: Date, index: true },
  active: { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'timeanalysis',
});

TimeAnalysisSchema.plugin(schemaHooks);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  TimeAnalysisSchema._customUserContext = userCxt
  return db.model('TimeAnalysis', TimeAnalysisSchema);
}

async function getPreMatchQuery(context){
  const preMatchQuery = {};
  if (context.userType === 'STUDENT') {
    preMatchQuery['studentId'] = context.studentId;
  }
  // const hierarchyData = await fetchNodesWithContext({ levelNames: ['Class', 'Branch'] }, context);
  // const contextClasses = Array.from(new Set(hierarchyData.filter(x => x.levelName === 'Class').map(x => x.child)));
  // const contextBranches = Array.from(new Set(hierarchyData.filter(x => x.levelName === 'Branch').map(x => x.child)));
  // let contextOrientations = []
  // if(context.hierarchy && context.orientations && context.orientations.length){
  //     contextOrientations = context.orientations;
  // }
  // preMatchQuery['refs.class.name'] = {$in: contextClasses };
  // preMatchQuery['refs.branch.name'] = { $in: contextBranches };
  // if(contextOrientations.length) preMatchQuery['refs.orientation.name'] = { $in: contextOrientations };
  return preMatchQuery;
}

async function schemaHooks (schema, options) {
  schema.pre(['find', 'count'], async function(next) {
    const context = schema._customUserContext;
    const preMatchQuery = await getPreMatchQuery(context)
    const query = { $and: [preMatchQuery, this._conditions] }
    this._conditions = query;
    next();
  });

  TextbookSchema.pre('aggregate', async function(next) {
    const context = schema._customUserContext;
    const preMatchQuery = await getPreMatchQuery(context)
    this.pipeline().unshift({ $match: preMatchQuery });
    next();
  });
}

export default {
  getModel,
};
