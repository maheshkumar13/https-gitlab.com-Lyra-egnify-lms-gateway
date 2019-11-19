/**
 *@description
 *    This File contains the Mongoose Schema defined for TestResult
 * @author
 *   Mohit
 * @date
 *    XX/XX/2018
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const ResponseDataSchema = new mongoose.Schema({
  evaluation: Object,
  score: Object,
  response: Object,
});

const CWUAnalysisType = new mongoose.Schema({
  C: { type: Number , default : null},
  W: { type: Number , default : null},
  U: { type: Number , default : null},
});

const TestMasterResultSchema = new mongoose.Schema(
  {
    // test data
    questionPaperId: { type: String, required: true , index : true},
    // student data
    studentId: { type: String, required: true , index : true },

    // response data
    responseData: ResponseDataSchema,
    active: { type: Boolean, default: true },

    // Analysis data
    cwuAnalysis: { type: CWUAnalysisType },
    obtainedMarks: { type: Number , default : null},
    percentage : { type : Number, default : null},
    totalMarks : { type : Number , default : null},
    startedAt : { type : Date},
    completedAt : { type : Date , default : null},
    totalQuestions : { type : Number , default : null},
    classCode: { type : String , default : null},
    textbookCode : { type : String, default : null},
    subjectCode : { type : String, default : null},
    branch  : { type : String, default : null},
    orientation : { type : String, default : null},
    timeTaken : { type : String, default : null},
    rank :  { type : Number, default : null},
    status : { type : String, default : null}, //COMPLETED OR STARTED
    instructionAccepted : { type : Boolean, default : true},
    syncDbUrl : { type : String,default : null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('TestMasterResult', TestMasterResultSchema);
}

export default {
  getModel,
};
