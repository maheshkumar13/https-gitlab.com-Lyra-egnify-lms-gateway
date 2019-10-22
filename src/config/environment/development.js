/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    'mongodb://localhost/tenantregistry-lms-dev',
  },
  // Seed database on startup
  seedDB: false,
  services: {
    // sso: 'http://localhost:3002',
    sso: process.env.SVC_SSO || 'https://accounts.dev.rankguru.com',
    // egnifyAccountsURL: process.env.SVC_SSO || 'http://localhost:3002',
    egnifyAccountsURL: process.env.SVC_SSO || 'https://accounts.dev.rankguru.com',
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
  parser:{
    uri : process.env.PARSER_SERVICE || "http://13.235.219.180:8080/parse/"
  },
  elasticSearch:{
    url : process.env.ELASTIC_SEARCH_URL || "http://13.235.245.210:9200/"
  }
};