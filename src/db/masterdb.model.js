import mongoose from 'mongoose';

const ConnectionSchema = new mongoose.Schema({
  instituteId: { type: String, required: true },
  instituteName: { type: String },
  uri: {
    setting: { type: String, required: true },
    test: { type: String, required: true },
  },
  active: { type: Boolean, default: true },
});

export default mongoose.connection.model('connections', ConnectionSchema);
