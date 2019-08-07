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
import { addChapter,updateChapter } from './utils';

const nameCodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, index: true }
})

const refsSchema = new mongoose.Schema({
  textbook: { type: nameCodeSchema, required: true },
})

const ConceptTaxonomySchema = new mongoose.Schema({
  child: { type: String, required: true },
  childCode: { type: String, required: true , es_indexed: true },
  code: { type: String },
  levelName: { type: String, required: true },
  parentCode: { type: String, required: true },
  refs: { type: refsSchema, description: 'References'},
  active: { type: Boolean, default: true },
  viewOrder: { type: Number },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});


export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('ConceptTaxonomy', ConceptTaxonomySchema);
}

ConceptTaxonomySchema.post('save',function(doc, next){
  setTimeout(function(){
    addChapter(doc);
  },10);
  next();
});

ConceptTaxonomySchema.post('findOneAndUpdate',function(doc, next){
  setTimeout(function(){
    updateChapter(doc);
  },10)
  next();
});

export default {
  getModel,
};
