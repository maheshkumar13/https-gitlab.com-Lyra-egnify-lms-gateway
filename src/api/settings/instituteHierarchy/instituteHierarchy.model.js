import { getDB } from '../../../db';

const mongoose = require('mongoose');

const ancestorSchema = new mongoose.Schema({
  child: { type: String },
  childCode: { type: String, index: true },
  level: { type: Number },
  levelName: { type: String },
  parent: { type: String },
  parentCode: { type: String },
});

const instituteHierarchy = new mongoose.Schema({
  pathId: { type: String, default: '', index: true },
  lowerPathId: {type: String, default: '', index: true},
  child: { type: String, required: true, maxlength: 50 },
  childCode: { type: String, required: true, unique: true },
  parent: { type: String },
  parentCode: { type: String },
  level: { type: Number, required: true },
  levelName: { type: String },
  numberOfChildren: { type: Number, default: 0 },
  lastChildNode: { type: Number, default: 0 },
  description: { type: String, default: '', maxlength: 250 },
  hierarchyId: { type: String },
  anscetors: { type: [ancestorSchema], default: [] },
  taxonomyReferences: {},
  isLeafNode: { type: Boolean, default: true },
  category: { type: String, enum: ['A', 'B', 'C'], description: 'Category' }, 
  active: { type: Boolean, default: true },
  metadata: {},
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

instituteHierarchy.index({
  child: 1, parent: 1, parentCode: 1,
}, { unique: true });


export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('InstituteHierarchy', instituteHierarchy);
}
export default {
  getModel,
};
