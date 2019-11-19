
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const SchedulerTimeAnalysisSchema = new mongoose.Schema({
  date: { type: Date },
  success: { type: Boolean },
  triggeredType: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'schedulerTimeAnalysis',
});

export async function getModel() {
  const db = await getDB('Egni_u001');
  return db.model('SchedulerTimeAnalysis', SchedulerTimeAnalysisSchema);
}

export default {
  getModel,
};
