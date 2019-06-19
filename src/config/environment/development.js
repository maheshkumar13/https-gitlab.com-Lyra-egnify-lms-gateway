/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/tenantregistry-lms-dev',
  },
  // Seed database on startup
  seedDB: false,
  services: {
    sso: 'http://localhost:3002',
    // sso: 'https://accounts.dev.lms.egnify.io',
    egnifyAccountsURL: process.env.SVC_SSO || 'http://localhost:3002',
    // egnifyAccountsURL: process.env.SVC_SSO || 'https://accounts.dev.lms.egnify.io',
  },
  apolloEngineKey: 'service:egnify-jeet-dev:-aBvwR1LrRIp5ym1C6gVPQ',
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
};
