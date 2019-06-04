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
    subject: 100000,
    textbook: 100000,
    topic: 100000,
    contentMapping: 100000,
    question: 100000,
    instituteHierarchy: 100000,
    student: 100000,
  },

  redis: {
    auth: 1,
    host: 'redis-master.development.svc.cluster.local',
    password: 'CwADcltNY0',
  },

  // AWS
  AWS_S3_KEY: process.env.AWS_S3_KEY || 'AKIA4XBZMKL5IIJGR4UK',
  AWS_S3_SECRET: process.env.AWS_S3_SECRET || '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',
	AWS_S3_REGION: process.env.AWS_S3_REGION || 'ap-south-1',
  AWS_PUBLIC_BUCKET: process.env.AWS_PUBLIC_BUCKET || 'ekslmsprojectpublic',
  AWS_PUBLIC_BUCKET_FOLDER: 'samplefiles',
};
