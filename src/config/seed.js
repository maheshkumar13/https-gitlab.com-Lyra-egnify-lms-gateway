/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

import User from '../api/v1/user/user.model';

import { config } from './environment/';

export default function seedDatabaseIfNeeded() {
  if (config.seedDB) {
    User.find({}).remove()
      .then(() => {
        User.create({
          provider: 'local',
          name: 'Test User',
          email: 'test@example.com',
          password: 'test',
        }, {
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          password: 'admin',
        })
          .then(() => console.info('finished populating users'))
          .catch(err => console.error('error populating users', err));
      });
  }
}
