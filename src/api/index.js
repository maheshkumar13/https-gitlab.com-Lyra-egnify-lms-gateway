/**
 * API
 */

const concpetTaxonomy = require('./settings/conceptTaxonomy');
const instituteHierarchy = require('./settings/instituteHierarchy');
const contentMapping = require('./settings/contentMapping');

// Util modules
const uploadFile = require('./v1/uploadFile');
const downloadReports = require('./v1/downloadReports');
const user = require('./v1/user');
const auth = require('../auth').default;
const authValidation = require('./v1/authValidation');
const converter = require('./v1/converter');
const studentSync = require('./v1/studentSync');

export default function (app) {
  //  Insert API below
  app.use('/api/concpetTaxonomy', concpetTaxonomy);
  app.use('/api/instituteHierarchy', instituteHierarchy);
  app.use('/api/contentMapping', contentMapping);
  // Util APIs
  app.use('/api/v1/converter', converter);
  app.use('/api/v1/uploadFile', uploadFile);
  app.use('/api/v1/users', user);
  app.use('/api/v1/downloadReports', downloadReports);
  app.use('/auth', auth);
  app.use('/api/v1/authValidation', authValidation);
  app.use('/api/v1/studentSync', studentSync);
}
