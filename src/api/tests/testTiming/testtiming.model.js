import mongoose from 'mongoose';
import { getDB } from '../../../db';
const testTimingsSchema = new mongoose.Schema({
    testId: { type: String, required: true},
    hierarchyId: { type: String, required: true},
    startTime: { type: Date, required: true},
    endTime: { type: Date, required: true},
    duration: { type: Number, required: true},
    class: { type: String},
    orientations: { type: Array }
}, {
        timestamps : {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
          },
          collection:"testTimings"
});

export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('testTimings',testTimingsSchema);
}

export default {
    getModel,
};
