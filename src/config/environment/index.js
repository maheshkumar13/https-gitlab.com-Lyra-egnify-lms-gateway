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
  seedDB: false,

  // DB Connection Cleanup Interval In minuter
  timeInterval: process.env.DB_TTL || 10,
  modelTimeInterval: process.env.MODEL_TTL || 10,

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
      poolsize: 20,
      db: {
        safe: true,
      },
    },
  },

  cacheTimeOut: {
    subject: 86400,
    textbook: 86400,
    topic: 86400,
    contentMapping: 86400,
    question: 86400,
    instituteHierarchy: 86400,
    student: 43200,
  },

  redis: {
    host: process.env.REDIS_HOST || '35.244.34.84',
    password: process.env.REDIS_PASSWORD || 'rQsVPF2gbiHi',
  },

  // AWS
  AWS_S3_KEY: process.env.AWS_S3_KEY || 'AKIA4XBZMKL5IIJGR4UK',
  AWS_S3_SECRET: process.env.AWS_S3_SECRET || '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',
	AWS_S3_REGION: process.env.AWS_S3_REGION || 'ap-south-1',
  AWS_PUBLIC_BUCKET: process.env.AWS_PUBLIC_BUCKET || 'ekslmsprojectpublic',
  AWS_PUBLIC_BUCKET_FOLDER: 'samplefiles',
};

// Export the config object based on the NODE_ENV
// ==============================================
export const config = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {},
);

export default { config };
