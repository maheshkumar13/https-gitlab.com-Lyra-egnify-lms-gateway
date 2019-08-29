/**
 *@description
 *    This File contains the Mongoose Schema defined for Marking
 * @Author :
 *   Mohit Agarwal
 * @date
 *    23/08/2019
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const MarkingSchema = new mongoose.Schema({
    name : { type : String, requried : true , unique : true },
    totalMarks : { type : Number , default : null },
    totalQuestions : { type : Number , default : null },
    eval : {
        rightAnswer : { type : Number , requried : true },
        wrongAnswer : { type : Number , required : true },
        unAttempted : { type : Number , default : 0 }
    }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('MarkingScheme', MarkingSchema);
}

export default {
  getModel,
};
