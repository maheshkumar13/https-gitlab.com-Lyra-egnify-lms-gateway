import mongoose from 'mongoose';
import { getDB } from '../../../db';
const testTimingsSchema = new mongoose.Schema({
    _id: {type: String, required: true, index: true},
    testId: { type: String, required: true},
    hierarchyId: { type: String, required: true},
    startTime: { type: Date, required: true},
    endTime: { type: Date, required: true},
    duration: { type: Number, required: true},
    class: { type: String},
    orientations: { type: Array }
}, {
        timestamps : true
});

export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('testTimings',testTimingsSchema);
}

export default {
    getModel,
};
