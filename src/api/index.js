/**
 * API
 */

const academicYear = require('./academicYear');

export default function (app) {
  //  Insert API below
  app.use('/api/academicYear', academicYear);
}
