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
    egnifyAccountsURL: process.env.SVC_SSO || 'http://localhost:3002',
  },
  apolloEngineKey: 'service:egnify-jeet-dev:-aBvwR1LrRIp5ym1C6gVPQ',
};
