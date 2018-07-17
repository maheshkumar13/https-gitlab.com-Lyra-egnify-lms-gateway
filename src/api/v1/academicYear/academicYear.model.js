/**
 *@description
 *    This File contains the Mongoose Schema defined for AcademicYear
 * @Author :
 *    Bharath Vemula
 * @date
 *    22/02/2018
 * version
 *    1.0.0
 */
import mongoose from 'mongoose';

const AcademicYearSchema = new mongoose.Schema({
  // id: { type: String, required: true },
  academicYear: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, required: true },
  institute: { type: String },

  active: Boolean,
});

export default mongoose.model('AcademicYear', AcademicYearSchema);
