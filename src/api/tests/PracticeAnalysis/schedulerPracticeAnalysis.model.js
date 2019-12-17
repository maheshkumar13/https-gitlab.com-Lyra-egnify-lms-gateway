/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
import mongoose from 'mongoose';
import { getDB } from '../../../db';
const schedulerPracticeAnalysisSchema = new mongoose.Schema({
    date: { type: String, unique:true, required: true },
    trigger: { type: Boolean,default :false ,required: true },
    status: { type: String, enum: ['started', 'completed','failed']},
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'schedulerPracticeAnalysis'
});


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('schedulerPracticeAnalysis', schedulerPracticeAnalysisSchema);
}

export default {
    getModel,
};
