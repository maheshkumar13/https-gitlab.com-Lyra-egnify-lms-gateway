/* eslint no-process-env:0 */

// Production specific configuration
// =================================
module.exports = {
  // Server port
  port: process.env.PORT || 3000,

  // MongoDB connection options
  mongo: {
    uri:
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      'mongodb://localhost/hydra-settings-prod',
  },
  services: {
    sso: process.env.SVC_SSO || 'http://localhost:3002',
  },
  apolloEngineKey: process.env.APOLLO_ENGINE_KEY || 'XXXX',

  cacheTimeOut: {
    subject: 600000,
    textbook: 600000,
    topic: 600000,
    contentMapping: 600000,
    question: 600000,
    instituteHierarchy: 600000,
    student: 600000,
  },

  redis: {
    auth: 0,
    host: 'rankguru-redis.3odpbz.clustercfg.aps1.cache.amazonaws.com',
    password: '',
  },

  // AWS
  AWS_S3_KEY: process.env.AWS_S3_KEY || 'AKIA4XBZMKL5IIJGR4UK',
  AWS_S3_SECRET: process.env.AWS_S3_SECRET || 'b3phrDHsFYBLJjGZY1CiMI8trwa2roJk3QSnzJ8N',
  AWS_S3_REGION: process.env.AWS_S3_REGION || 'ap-south-1',
  AWS_PUBLIC_BUCKET_FOLDER: 'samplefiles',
};
