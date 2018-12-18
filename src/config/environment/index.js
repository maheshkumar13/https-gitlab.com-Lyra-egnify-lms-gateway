/* eslint-disable */

import path from 'path';
import _ from 'lodash';

// function requiredProcessEnv(name) {
//   if(!process.env[name]) {
//     throw new Error('You must set the ' + name + ' environment variable');
//   }
//   return process.env[name];
// }

// All configurations will extend these options
// ============================================
const all = {

  // Cloud Storage bucket
  GCLOUD_PROJECT: process.env.GCLOUD_PROJECT||'egnify-product',

  // Cloud Storage bucket
  CLOUD_BUCKET: process.env.CLOUD_BUCKET||'vega-demo-cdn',

  env: process.env.NODE_ENV || 'development',

  // APP_ENGINE
  app_enigne: process.env.APP_ENGINE || false,

  // Server port
  port: process.env.PORT || 3000,

  // Should we populate the DB with sample data?
  seedDB: true,

  secrets: {
    session: 'vega-secret',
  },
  emailAuth: {
    user: process.env.MAILJET_API_KEY || 'a1fb4988b5a359099061d2cb8aebc80d',
    pass: process.env.MAILJET_API_SECRETKEY || '2fc962b7e3aae82acee17b355fb9de2d',
  },



  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true,
      },
    },
  },
  // Parser related config
  parser: {
    CELERY_BROKER_URL: process.env.CELERY_BROKER_URL || 'redis://vvqfBAUfPI@localhost:6379/0',
    CELERY_RESULT_BACKEND: process.env.CELERY_RESULT_BACKEND || 'redis://vvqfBAUfPI@localhost:6379/0',
    QUEUE_NS: process.env.PARSER_QUEUE_NS || 'hydra-parser-dev-mq',
    celeryTask: {
      datConverter: 'datConverter',
      iitConverter: 'iitConverter',
      getCsv: 'getCsv',
    },
  },
};  

// Export the config object based on the NODE_ENV
// ==============================================
export const config = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {},
);

export default { config };
