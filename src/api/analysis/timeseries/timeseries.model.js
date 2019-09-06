/**
 *@description
 * This File contains the Mongoose Schema defined for temperory time serires data base for calculation
 * @Author :
 *   Aslam
 * @date
 *    20/08/2019
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const timestampsSchema = new mongoose.Schema({
  entry: { type: Date },
  exit: { type: Date },
  medium: { type: String, enum: ['web', 'app'], required: true },
});

const timeseriesSchema = new mongoose.Schema({
  studentId: { type: String, requred: true },
  assetId: { type: String, required: true },
  date: { type: Date },
  totalTimeSpent: { type: Number, required: true },
  timestamps: { type: [timestampsSchema], default: [] },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('Timeseries', timeseriesSchema);
}

export default {
  getModel,
};
