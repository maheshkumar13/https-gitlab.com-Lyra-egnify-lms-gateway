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

// import { addContent, updateContent } from '../conceptTaxonomy/utils'

const contentSchema = new mongoose.Schema({
  name: { type: String },
  category: { type: String,default: '' },
  type: { type: String, default: '' },
});

const resourceSchema = new mongoose.Schema({
  key: { type: String, default: '' },
  size: { type: Number , default: 0},
  type: { type: String ,default: ''},
});

const publicationSchema = new mongoose.Schema({
  publisher: { type: String, default: '' },
  year: { type: String, default: '' },
});

const nameCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
});

const refsSchema = new mongoose.Schema({
  textbook: { type: nameCodeSchema, required: true },
  topic: { type: nameCodeSchema, required: true },
});


const contentMappingSchema = new mongoose.Schema({
  assetId: { type: String },
  content: { type: contentSchema },
  resource: { type: resourceSchema },
  refs: { type: refsSchema, required: true },
  orientation: [String],
  publication: { type: publicationSchema },
  category: { type: String, enum: ['A', 'B', 'C', ''], default: null },
  branches: { type: [String], default: null },
  active: { type: Boolean, default: false },
  reviewed: { type: Boolean, default: false },
  coins: { type: Number, default: 0 },
  timgPath: { type: String },
  viewOrder: { type: Number },
  studyWeek: { type: Number },
  gaStatus: { type: Boolean, default: false },
  metaData: {},
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('contentMapping', contentMappingSchema);
}

// contentMappingSchema.post('save',function(doc ,next){
//   setTimeout(function(){
//     addContent(doc);
//   },10);
//   next();
// });

// contentMappingSchema.post('updateOne',function(doc ,next){
//   setTimeout(function(){
//     console.log(this);
//     addContent(doc.toJSON());
//   },10);
//   next();
// });

// contentMappingSchema.post('findOneAndUpdate',function(doc, next){
//   setTimeout(function(){
//     updateContent(doc);  
//   },10);
//   next();
// });

export default {
  getModel,
};
