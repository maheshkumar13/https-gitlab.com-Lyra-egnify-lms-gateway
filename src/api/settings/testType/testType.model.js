
import mongoose from 'mongoose';
import { getDB } from '../../../db';

  
const TestTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, description: 'Name of the testtype' },
    code: { type: String, required: true, index: true, description: 'Internal code for the testtype' },
    classCode: { type: String, description: 'classcode'},
    educationType :{type : String },
    subjects :{type: [String], description:'subject codes'},
    active: { type: Boolean, default: true },
    },{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
  
  export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('TestType', TestTypeSchema);
  }
  
  export default {
    getModel,
  };

  