/**
 @author Nikhil Kumar
 @date    23/01/2018
*/
import mongoose from 'mongoose';
import { getDB } from '../../db';

const nameSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const refsSchema = new mongoose.Schema({
    class: { type: nameSchema, required: true },
    branch: { type: nameSchema, required: true },
    orientation: { type: nameSchema, required: true },
});
const studentLedgerSchema = new mongoose.Schema({
    studentId: { type: String, index: true, required: true },
    assetId: { type: String, index: true, required: true },
    coins: { type: Number },
    transactionType: { type: String },
    finalAmount: { type: Number },
    refs: { type: refsSchema, required: true },
    category: { type: String }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'studentledgers'
});


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('studentledgers', studentLedgerSchema);
}

export default {
    getModel,
};
