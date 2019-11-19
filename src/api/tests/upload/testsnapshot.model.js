/**
 *@description
 *    This File contains the Mongoose Schema defined for TestsSnapshot
 * @Author :
 *   Mohit Agarwal
 * @date
 *    23/08/2019
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';
const Schema = mongoose.Schema;

const TestSnapshotSchema = new mongoose.Schema({
    studentId : { type : String  },
    testId : { type : String  },
    studentName : { type: String ,default :null},
    fatherName : { type : String , default : null },
    phone : { type : String,default : null},
    email : { type : String , default : null},
    dob : { type : String , deffault : null},
    gender : { type : String , default : null},
    category : { type : String, default : null},
    hierarchy : { type : Array, default : []},
    egnifyId : { type  : String , default : null},
    active : { type : Boolean , default : true},
    accessTag : { type : Object , default : {}},
    testName : { type : String , default : null},
    hierarchyTag : { type : String , default : null},
    behaviourData : { type : Array , default : []},
    hierarchyLevels  :  { type : Object , deafult : {}},
    responseData : { type : Schema.Types.Mixed, default : {}},
    userCreated : { type : Boolean , default : true}
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  minimize : false
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('testStudentSnapShot', TestSnapshotSchema);
}
export default {
  getModel,
};
