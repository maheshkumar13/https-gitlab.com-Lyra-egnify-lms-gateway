/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/tenantregistry',
  },
  // Seed database on startup
  seedDB: true,
  services: {
    settings: 'http://localhost:5001',
    test: 'http://localhost:5002',
    sso: 'https://accounts.dev.hydra.egnify.io',
    // egnifyAccountsURL:  process.env.SVC_SSO || 'https://accounts.dev.hydra.egnify.io',
  },
  apolloEngineKey: 'service:egnify-jeet-dev:-aBvwR1LrRIp5ym1C6gVPQ',
};
