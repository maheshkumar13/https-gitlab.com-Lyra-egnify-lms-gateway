/**
 * API
 */

const concpetTaxonomy = require('./settings/conceptTaxonomy');
const instituteHierarchy = require('./settings/instituteHierarchy');
const contentMapping = require('./settings/contentMapping');
const textbook = require('./settings/textbook');
const testUpload = require('./tests/questions');
const studentLedger = require('./studentLedger');
const practiceStudent = require('./tests/masterResults');
const practiceAnalysis = require('./tests/PracticeAnalysis');
// Util modules
const uploadFile = require('./v1/uploadFile');
const downloadReports = require('./v1/downloadReports');
const user = require('./v1/user');
const auth = require('../auth').default;
const authValidation = require('./v1/authValidation');
const converter = require('./v1/converter');
const studentSync = require('./v1/studentSync');
const hierarchySync = require('./v1/hierarchySync');
const elasticindexing = require('./indexelasticsearch/indexcontent/index');
const test = require('./tests/upload');
const timeAnalysis = require('./analysis/timeAnalysis');

export default function (app) {
  //  Insert API below
  app.use('/api/concpetTaxonomy', concpetTaxonomy);
  app.use('/api/instituteHierarchy', instituteHierarchy);
  app.use('/api/contentMapping', contentMapping);
  app.use('/api/textbook', textbook);
  app.use('/api/practice',testUpload);
  app.use('/api/test',test);
  app.use('/api/studentLedger', studentLedger);

  // Util APIs
  app.use('/api/v1/converter', converter);
  app.use('/api/v1/uploadFile', uploadFile);
  app.use('/api/v1/users', user);
  app.use('/api/v1/downloadReports', downloadReports);
  app.use('/auth', auth);
  app.use('/api/v1/authValidation', authValidation);
  app.use('/api/v1/studentSync', studentSync);
  app.use('/api/v1/hierarchySync', hierarchySync);
  app.use('/api/elastic', elasticindexing);
  app.use('/api/timeAnalysis', timeAnalysis);
  app.use('/api/practiceStudent', practiceStudent);
  app.use('/api/practiceAnalysis', practiceAnalysis);
}
