import _ from 'lodash';
import mongoose from 'mongoose';
import cron from 'node-cron';
import Connections from './masterdb.model';
import { config } from '../config/environment';


mongoose.Promise = require('bluebird');

// Global DB stack
const dbStack = {};

function isInactiveConnection(timeStamp) {
  const currentTime = new Date(Date.now());
  const LastUpdatedTime = new Date(timeStamp);
  const difference = currentTime.getTime() - LastUpdatedTime.getTime();
  // console.info(difference);

  const resultInMinutes = Math.floor(difference / 60000);
  // console.info(resultInMinutes);
  if (resultInMinutes >= config.timeInterval) {
    return true;
  }
  return false;
}
function isInactiveModelConnection(timeStamp) {
  const currentTime = new Date(Date.now());
  const LastUpdatedTime = new Date(timeStamp);
  const difference = currentTime.getTime() - LastUpdatedTime.getTime();
  // console.info(difference);

  const resultInMinutes = Math.floor(difference / 60000);
  // console.info(resultInMinutes);
  if (resultInMinutes >= config.modelTimeInterval) {
    return true;
  }
  return false;
}


function cleanDatabaseConnections() {
  console.info(`running cleanup every ${config.timeInterval} minutes`, '\n Initial Stack ', Object.keys(dbStack));
  _.forEach(dbStack, (value, key) => {
    if (key !== 'master' && isInactiveConnection(dbStack[key].timeStamp)) {
      if (dbStack[key].models) {
        _.forEach(dbStack[key].models, (model) => {
          _.forEach(model, (accessModelData) => {
            accessModelData.model.modelCleanUp(key);
          });
        });
      }
      dbStack[key].db.close(() => {
        console.info(`Mongoose connection closed for db ${key}`);
        delete dbStack[key];
      });
    }
  });
}

function cleanModelConnections() {
  console.info(`running model cleanup every ${config.modelTimeInterval} minutes`);
  _.forEach(dbStack, (value, key) => {
    if (key !== 'master') {
      if (dbStack[key].models) {
        _.forEach(dbStack[key].models, (model, modelName) => {
          _.forEach(model, (accessModelData, tenantId) => {
            if (isInactiveModelConnection(accessModelData.timeStamp)) {
              accessModelData.model.modelCleanUp(key, tenantId);
              delete dbStack[key].models[modelName][tenantId];
            }
          });
        });
      }
    }
  });
}

// cron job for cleaning up inactive connections
const databaseConnectionCleaner = cron.schedule(`*/${config.timeInterval} * * * *`, cleanDatabaseConnections);
// cron job for cleaning up inactive models
const modelConnectionCleaner = cron.schedule(`*/${config.modelTimeInterval} * * * *`, cleanModelConnections);
/**
* gracefulShutdown - funtion to gracefully shutdown server
*
* @param  {type} msg      message to be sent
* @param  {type} callback call back funtion
*/
function gracefulShutdown(msg, callback) {
  // console.info('gracefulShutdown');
  const keys = _.keysIn(dbStack);
  _.forEach(keys, (key, index) => {
    dbStack[key].db.close(() => {
      console.info(`Mongoose disconnected through ${msg}`);
      if (index + 1 === keys.length) {
        callback();
        databaseConnectionCleaner.stop();
        modelConnectionCleaner.stop();
        databaseConnectionCleaner.destroy();
        modelConnectionCleaner.destroy();
      }
    });
  });
}


/**
 * initDB - function to initialize the db
 *
 */
export function initDB() {
  mongoose.connect(config.mongo.uri, config.mongo.options);
  mongoose.connection.on('error', (err) => {
    console.info(`MongoDB connection error: ${err}`);
    process.exit(-1); // eslint-disable-line no-process-exit
  });

  mongoose.connection.on('connected', () => {
    console.info('Mongoose connected to', config.mongo.uri);
    dbStack.master = {};
    dbStack.master.db = mongoose.connection;
    dbStack.master.timeStamp = Date.now();
    databaseConnectionCleaner.start();
    modelConnectionCleaner.start();
  });
  // For nodemon restarts
  process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
  // For app termination
  process.on('SIGINT', () => {
    gracefulShutdown('App termination (SIGINT)', () => {
      process.exit(0);
    });
  });
  // For Heroku app termination
  process.on('SIGTERM', () => {
    gracefulShutdown('App termination (SIGTERM)', () => {
      process.exit(0);
    });
  });
}


/**
 * getDB - function to get a db connection instance for a particuler institute
 *
 * @param  {String} instituteId instituteId
 * @return {DB Connection}      Db connection instance for that institute
 */
export async function getDB(instituteId) {
  // console.info(instituteId);
  if (dbStack[instituteId]) {
    dbStack[instituteId].timeStamp = Date.now();
    // console.info('DB Connections', Object.keys(dbStack));
    return dbStack[instituteId].db;
  }

  const connection = await Connections.findOne({ instituteId });
  console.log('instituteId', instituteId)
  dbStack[instituteId] = {};
  dbStack[instituteId].db = await mongoose.createConnection(connection.uri.setting, { poolsize: 20 });
  console.info('New Connection Created to', connection.uri.setting);
  dbStack[instituteId].timeStamp = Date.now();
  // console.info('DB Connections', Object.keys(dbStack));
  return dbStack[instituteId].db;
}

export function setModelWithContext(model, instituteId, tenantId) {
  const { modelName } = model;

  if (!dbStack[instituteId].models) {
    dbStack[instituteId].models = {};
  }

  if (!dbStack[instituteId].models[modelName]) {
    dbStack[instituteId].models[modelName] = {};
  }

  if (!dbStack[instituteId].models[modelName][tenantId]) {
    dbStack[instituteId].models[modelName][tenantId] = {
      model,
      timeStamp: Date.now(),
    };
  } else {
    dbStack[instituteId].models[modelName][tenantId].timeStamp = Date.now();
  }
  return dbStack[instituteId].models[modelName][tenantId];
}


export default {
  initDB,
  getDB,
  setModelWithContext,
};
