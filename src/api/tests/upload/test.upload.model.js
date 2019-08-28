/**
 *@description
 *    This File contains the Mongoose Schema defined for Tests
 * @Author :
 *   Mohit Agarwal
 * @date
 *    23/08/2019
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';
const Schema = mongoose.Schema;
const dataTables = require('mongoose-datatables');

const TestInfo = new mongoose.Schema({
    name : { type : String  ,index : true},
    start_time : { type : Date  , index : true,default :null},
    end_time : { type : Date  , index : true,default :null},
    date : { type : Date  , index : true,default :null},
    duration : { type : Number ,default :null},
    paper_id : { type : String, default : null,default :null}
});

const TestMapping = new mongoose.Schema({
    class : {
        code : { type : String , index : true},
        name : { type : String , index : true}
    },
    subject : {
        code : { type : String , index : true},
        name : { type : String , index : true}
    },
    textbook : {
        code : { type : String , index : true},
        name : { type : String , index : true}
    }
})

const TestSchema = new mongoose.Schema({
    mapping : { type : TestMapping  },
    test : { type : TestInfo  },
    marking_scheme : { type: Schema.Types.ObjectId ,default :null},
    active : { type : Boolean , default : false },
    file_key : { type : String,default : null},
    branches : { type : Array , default : []},
    orientations : { type : Array , deffault : []}
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  minimize : false
});

TestSchema.plugin(dataTables);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);

  return db.model('Test', TestSchema);
}

export default {
  getModel,
};
