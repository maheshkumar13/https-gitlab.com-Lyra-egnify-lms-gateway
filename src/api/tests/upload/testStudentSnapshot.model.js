import mongoose from 'mongoose';
import {
  getDB
} from '../../../db';

const TestStudentSnapshot = new mongoose.Schema({
	"databaseUrl" : {type: String},
	"hierarchyId" : {type: String},
	"key" : {type: String},
	"studentId" : {type: String},
	"testId" : {type: String},
	"textbook" : {type: String},
	"behaviourData" : {type: Object},
	"endTime" : {type: Object},
	"hierarchyLevels" : {type: Object},
	"responseData" : {type: Object},
	"startedAt" : {type: String},
	"status" : {type: String},
	"studentName" : {type: String},
	"syncStatus" : {type: String}
}, {
  collection: "testStudentSnapshot"
});

export async function getModel(userCxt) {
  const {
    instituteId
  } = userCxt;
  const db = await getDB(instituteId);

  return db.model('testStudentSnapshot', TestStudentSnapshot);
}

export default {
  getModel,
};

