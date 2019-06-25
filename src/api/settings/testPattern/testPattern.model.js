import mongoose from 'mongoose';
import { getDB } from '../../../db';

const MarksSchema = new mongoose.Schema({
  section: { type: Number, required: true },
  questionType: { type: String, required: true },
  // egnifyQuestionType: { type: String, enum: ['Single answer type', 'Multiple answer type', 'Integer type', 'Paragraph type', 'Matrix list type', 'Matrix match type'] },
  noOfOptions: { type: Number, default: 4 },
  numberOfQuestions: { type: Number, required: true },
  numberOfSubQuestions: { type: Number, default : 0},
  // marksPerQuestion: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  C: { type: Number, required: true, default: 0 },
  P: { type: Number, default: 0, default: 0 },
  W: { type: Number, required: true, default: 0 },
  U: { type: Number, required: true, default: 0 },
  // ADD: { type: Number, default: 0 },
  // paragraph_start: { type: [Number] }
});

const SubjectSchema = new mongoose.Schema({
  // tieBreaker: { type: Number, required: true },
  // code : {type : String},
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  marks: [MarksSchema],
  subject: { type: String, required: true },
  // subjectCode: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  // code: { type: String, required: true },
  // parentCode: { type: String, required: true },
});


const TestPatternSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  totalQuestions: { type: String, required: true },
  subjects: [SubjectSchema],
  totalMarks: { type: Number, required: true },
  testType: { type: String },
  markingSchemaType: { type: String },
  active: { type: Boolean, default: true },
  // default: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});


export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId, userCxt);
  return db.model('TestPattern', TestPatternSchema);
}

export default {
  getModel,
};
// export default mongoose.model('TestPattern', TestPatternSchema);
