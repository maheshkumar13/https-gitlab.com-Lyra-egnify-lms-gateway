/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
import mongoose from 'mongoose';
import { getDB } from '../../../db';
const practiceanalysisSchema = new mongoose.Schema({
    questionPaperId: { type: String, index: true, required: true },
    totalQuestion: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    max: { type: Number, required: true },
    min: { type: Number, required: true },
    average: { type: Number, required: true },
    
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'practiceanalysis'
});


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('practiceanalysis',practiceanalysisSchema);
}

export default {
    getModel,
};
