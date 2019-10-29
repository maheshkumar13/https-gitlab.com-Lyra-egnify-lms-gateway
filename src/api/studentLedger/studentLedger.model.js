/**
 *@description
 *    This File contains the Mongoose Schema defined for Questions
 * @Author :
 *   Aslam Shaik
 * @date
 *    27/12/2018
 */
import mongoose from 'mongoose';
import { getDB } from '../../db';


const studentLedgerSchema = new mongoose.Schema({
    studentId: { type: String },
    assetId: { type: String },
    coins: { type: Number },
    typeOfTransaction: { type: String },
    FinalAmount:{type:Number}
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('studentLedger', studentLedgerSchema);
}

export default {
    getModel,
};
