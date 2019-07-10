/**
   @description This file contains server configuration.

   @author Rahul Islam
   @date    XX/XX/2018
   @version 1.0.0
*/

// require('newrelic');

// import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import schema from './graphql/schema';

import { config } from './config/environment';
import * as auth from './auth/auth.service';
import seedDatabaseIfNeeded from './config/seed';

const { ApolloEngine } = require('apollo-engine');
const morgan = require('morgan');
const cors = require('cors');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://7d87b44860e44027996d3a8343063435@sentry.io/1494857' });

mongoose.Promise = require('bluebird');
// mongoose.set('debug', true);

const cachegoose = require('cachegoose');
cachegoose(mongoose);

// cachegoose(mongoose, {
//   engine: 'redis',    /* If you don't specify the redis engine,      */
//   port: 6379,         /* the query results will be cached in memory. */
//   host: config.redis.host,
//   password: config.redis.auth ? config.redis.password: ''
// });

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('connected', () => {
  console.info('Mongoose connected to', config.mongo.uri);
});
mongoose.connection.on('error', (err) => {
  console.info(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});


const app = express();
app.use(Sentry.Handlers.requestHandler());
app.use(cors());
app.use(morgan('short'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '32mb' }));
app.use(bodyParser.json({ limit: '32mb' }));

app.use('/', express.static(`${__dirname}/public`));
app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});
/* eslint no-unused-vars: 0 */
// The GraphQL endpoint
// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  passHeader: "'Authorization': localStorage.getItem('jwt_token'),'AccessControlToken': localStorage.getItem('token')",
}));
app.use(
  '/graphql',
  auth.isAuthenticated(),
  bodyParser.json(),
  graphqlExpress((req) => {
    // Some sort of auth function
    // const userForThisRequest = getUserFromRequest(req);
    console.info('Yay!! GraphQL Initilized');
    return {
      schema,
      context: req.user,
      // tracing: true,
      cacheControl: true,
    };
  }),
);

app.use('/api', auth.isAuthenticated())
require('./api').default(app);

app.get('/', (req, res) => res.send('Oh!! Yeah.'));

// seedDatabaseIfNeeded();

app.listen(config.port, () => {
  console.info(`The server is running at http://localhost:${config.port}/`);
});

// Initialize engine with your API key. Alternatively,
// set the ENGINE_API_KEY environment variable when you
// run your program.
// const engine = new ApolloEngine({
//   apiKey: config.apolloEngineKey,
// });

// Call engine.listen instead of app.listen(port)
// engine.listen({
//   port: config.port,
//   expressApp: app,
// });

console.info('RESTful API server started on: ');
