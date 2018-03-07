/* eslint no-process-env:0 */

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/vega-dev',
  },
  // Seed database on startup
  seedDB: true,
  services: {
    settings: 'http://localhost:5001',
  },
};
