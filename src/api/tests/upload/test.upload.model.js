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
    name : { type : String , required : true ,index : true},
    start_time : { type : Date , required : true , index : true},
    end_time : { type : Date , required : true , index : true},
    date : { type : Date , required : true , index : true},
    duration : { type : Number , required : true}
});

const TestMapping = new mongoose.Schema({
    class : {
        code : { type : String , required : true, index : true},
        name : { type : String , required : true , index : true}
    },
    subject : {
        code : { type : String , required : true, index : true},
        name : { type : String , required : true, index : true}
    },
    textbook : {
        code : { type : String , required : true, index : true},
        name : { type : String , required : true, index : true}
    }
})

const TestSchema = new mongoose.Schema({
    mapping : { type : TestMapping , requried : true },
    test : { type : TestInfo , required : true },
    marking_scheme : { type: Schema.Types.ObjectId },
    active : { type : Boolean , default : false },
    file_key : { type : String,default : null}
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
