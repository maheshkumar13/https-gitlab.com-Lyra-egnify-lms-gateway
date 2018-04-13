/**
 * API
 */

const uploadFile = require('./uploadFile');
// const conceptTaxonomy = require('./conceptTaxonomy');

export default function (app) {
  //  Insert API below
  app.use('/api/v1/uploadFile', uploadFile);
  app.use('/api/v1/users', require('./user'));

  app.use('/auth', require('./../../auth').default);
  
}
