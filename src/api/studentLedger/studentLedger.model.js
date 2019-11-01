
import mongoose from 'mongoose';
import { getDB } from '../../db';


const studentLedgerSchema = new mongoose.Schema({
    studentId: { type: String, index: true },
    assetId: { type: String, index: true },
    coins: { type: Number },
    typeOfTransaction: { type: String },
    FinalAmount:{type:Number}
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'studentledgers'
});


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('studentLedger', studentLedgerSchema);
}

export default {
    getModel,
};
