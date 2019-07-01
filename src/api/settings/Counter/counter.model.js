/**
  @description This file contains Schema for Counter.
  @author Aslam
  @date   23/03/2018
*/

import mongoose from 'mongoose';
import { getDB } from '../../../db';

const CounterSchema = new mongoose.Schema({
    _id: { type: String },
    sequence_value: {type: Number,default:1}  
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

//counterSchema.index({ _id: 1, seq: 1 }, { unique: true })

CounterSchema.statics.getNext = function ( args, callback) {
    return this.collection.findAndModify({ _id: args.counter }, [], { $inc: { sequence_value: args.value } }, { new: true, upsert: true}, callback);
}; 


export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId, userCxt);
    return db.model('Counter', CounterSchema);
}
export default {
    getModel,
  };
// export default mongoose.model('Counter', CounterSchema);


