/**
 *@description
 *    This File contains the Mongoose Schema defined for fileStatus
 * @author
 *   Aslam Shaik
 * @date
 *    18/05/2020
 */
import mongoose from 'mongoose';
import { getDB } from '../../db';

const FileStatusSchema = new mongoose.Schema(
  {
    fileStatusId: { type: String },
    message: { type: String },
    response: { type: Boolean },
    success: { type: Boolean },
    percentage: { type: Number },
    data: {},
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'filestatus',
  },
);

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('FileStatus', FileStatusSchema);
}

export default{
  getModel,
};

