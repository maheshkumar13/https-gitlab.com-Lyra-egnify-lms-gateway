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
    total_marks : { type : Number , default : null },
    total_questions : { type : Number , default : null },
    eval : {
        right_answer : { type : Number , requried : true },
        wrong_answer : { type : Number , required : true },
        unattempted : { type : Number , default : 0 }
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
