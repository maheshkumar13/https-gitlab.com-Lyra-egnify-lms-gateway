/**
 * API
 */

const academicYear = require('./academicYear');
// const conceptTaxonomy = require('./conceptTaxonomy');

export default function (app) {
  //  Insert API below
  app.use('/api/academicYear', academicYear);
  // app.use('/api/conceptTaxonomy', conceptTaxonomy);
}
