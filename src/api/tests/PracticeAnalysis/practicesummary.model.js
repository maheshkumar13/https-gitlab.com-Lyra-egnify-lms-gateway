import mongoose from 'mongoose';
import { getDB } from '../../../db';
const practiceSummary = new mongoose.Schema({
    orientation: { type: String },
    branch: { type: String },
    class: { type: String },
    numberOfPractices: { type: Number, default: 0 },
    numberOfStudents: { type: Number,default: 0 },
    numberOfStudentsAttempted: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'practiceSummary'
});


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('practiceSummary', practiceSummary);
}

export default {
    getModel,
};
