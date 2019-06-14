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
    subject: process.env.CACHE_TIMEOUT_SUBJECT || 1,//86400,
    textbook: process.env.CACHE_TIMEOUT_TEXTBOOK || 1, //86400,
    topic: process.env.CACHE_TIMEOUT_TOPIC || 1, //86400,
    contentMapping: process.env.CACHE_TIMEOUT_CONTENTMAPPING || 1, //86400,
    question: process.env.CACHE_TIMEOUT_QUESTION || 1, //86400,
    instituteHierarchy: process.env.CACHE_TIMEOUT_INSTITUTEHIERARCHY || 1, //86400,
    student: process.env.CACHE_TIMEOUT_STUDENT || 1, //43200,
  },

  redis: {
    auth: process.env.REDIS_AUTH || 1,
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
