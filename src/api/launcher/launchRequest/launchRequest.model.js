/**
 *@description
 *    This File contains the Mongoose Schema defined for Media Launch Request
 * @Author :
 *   Rahul
 * @date
 *    23/04/2019
 */
import mongoose from 'mongoose';
import { getDB } from '../../../db';

const LaunchRequestSchema = new mongoose.Schema({
  active: { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('LaunchRequest', LaunchRequestSchema);
}

export default {
  getModel,
};
