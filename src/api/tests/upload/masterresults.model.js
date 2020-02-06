import mongoose from 'mongoose';
import {
  getDB
} from '../../../db';
const Schema = mongoose.Schema;

const MasterResultSchema = new mongoose.Schema({
    active:{ type: Boolean },
    testId: { type: String },
    studentId: { type: String },
    id: { type: String },
    name: { type: String },
    hierarchyLevels: { type: Schema.Types.Mixed },
    accessTag: { type: Schema.Types.Mixed },
    studentMetaData: { type: Schema.Types.Mixed },
    rankOrder: { type: Schema.Types.Mixed },
    cwuAnalysis: { type: Schema.Types.Mixed },
    topicAnalysis: { type: Schema.Types.Mixed },
    responseData: { type: Schema.Types.Mixed },
    numberOfTests: { type: Number }
}, {
  collection: "test_masterresults"
});

export async function getModel(userCxt) {
  const {
    instituteId
  } = userCxt;
  const db = await getDB(instituteId);

  return db.model('test_masterresults', MasterResultSchema);
}

export default {
  getModel,
};
