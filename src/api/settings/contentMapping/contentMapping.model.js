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

const contentSchema = new mongoose.Schema({
  name: { type: String },
  category: { type: String },
  type: { type: String },
});

const resourceSchema = new mongoose.Schema({
  key: { type: String },
  size: { type: Number },
  type: { type: String },
});

const publicationSchema = new mongoose.Schema({
  publisher: { type: String },
  year: { type: String },
});

const nameCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
});

const refsSchema = new mongoose.Schema({
  textbook: { type: nameCodeSchema, required: true },
  topic: { type: nameCodeSchema, required: true },
});


const contentMappingSchema = new mongoose.Schema({
  content: { type: contentSchema },
  resource: { type: resourceSchema },
  refs: { type: refsSchema, required: true },
  orientation: [String],
  publication: { type: publicationSchema },
  category: { type: String, enum: ['A', 'B', 'C',''], default: null },
  branches: { type: [String], default: null },
  active: { type: Boolean, default: true },
  coins: { type: Number, default: 0 },
  metaData: {},
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('contentMapping', contentMappingSchema);
}

export default {
  getModel,
};
