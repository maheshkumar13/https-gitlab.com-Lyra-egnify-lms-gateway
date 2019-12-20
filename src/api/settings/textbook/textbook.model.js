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
import { fetchNodesWithContext } from '../../../api/settings/instituteHierarchy/instituteHierarchy.controller';

const nameCodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, index: true }
})

const refsSchema = new mongoose.Schema({
  class: { type: nameCodeSchema, required: true },
  subject: { type: nameCodeSchema, required: true },
})

const TextbookSchema = new mongoose.Schema({
  name: { type: String, required: true, description: 'Name of the textbook' },
  imageUrl: { type: String, description: 'Image url of the textbook' },
  code: { type: String, required: true, index: true, description: 'Internal code for the textbook' },
  refs: { type: refsSchema, description: 'References'},
  publisher: { type: String },
  active: { type: Boolean, default: true },
  orientations:{ type: [String], default: null },
  branches: { type: [String], default: null },
  viewOrder: { type: Number },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

TextbookSchema.plugin(schemaHooks);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  TextbookSchema._customUserContext = userCxt
  return db.model('Textbook', TextbookSchema);
}

async function getPreMatchQuery(context){
  const hierarchyData = await fetchNodesWithContext({ levelNames: ['Class', 'Branch'] }, context);
  const contextClassCodes = Array.from(new Set(hierarchyData.filter(x => x.levelName === 'Class').map(x => x.childCode)));
  const contextBranches = Array.from(new Set(hierarchyData.filter(x => x.levelName === 'Branch').map(x => x.child)));
  contextBranches.push(null);
  let contextOrientations = []
  if(context.hierarchy && context.orientations && context.orientations.length){
      contextOrientations = context.orientations;
    contextOrientations.push(null);
  }
  const preMatchQuery = {};
  preMatchQuery['refs.class.code'] = {$in: contextClassCodes };
  preMatchQuery['branches'] = { $in: contextBranches };
  if(contextOrientations.length) preMatchQuery['orientations'] = { $in: contextOrientations };
  return preMatchQuery;
}

async function schemaHooks (schema, options) {
  schema.pre(['find', 'count'], async function(next) {
    const context = schema._customUserContext;
    const preMatchQuery = await getPreMatchQuery(context)
    const query = { $and: [preMatchQuery, this._conditions] }
    this._conditions = query;
    console.log("query: ",query)
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
