/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
import mongoose from 'mongoose';
import { getDB } from '../../../db';
const testTimingsSchema = new mongoose.Schema({
    testId: { type: String},
    hierarchyId: { type: String},
    class: { type: String},
    orientations : { type : Array},
    startTime: { type: Date},
    endTime: { type: Date},
    duration: { type: Number},
}, {
        collection: 'testTimings'
});

export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('testTimings',testTimingsSchema);
}

export default {
    getModel,
};
