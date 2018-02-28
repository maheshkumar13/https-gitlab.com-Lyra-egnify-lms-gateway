/**
   @description This file contains server configuration.

   @author Rahul Islam
   @date    XX/XX/2018
   @version 1.0.0
*/

// import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import { config } from './config/environment';

const morgan = require('morgan');

mongoose.Promise = require('bluebird');
// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', (err) => {
  console.info(`MongoDB connection error: ${err}`);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books },
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(morgan('short'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* eslint no-unused-vars: 0 */
// The GraphQL endpoint
// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress((req) => {
    // Some sort of auth function
    // const userForThisRequest = getUserFromRequest(req);
    console.info('Yay!! GraphQL Initilized');
    return {
      schema,
      context: {},
      tracing: true,
      cacheControl: true,
    };
  }),
);
// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

require('./api').default(app);

app.listen(config.port, () => {
  console.info(`The server is running at http://localhost:${config.port}/`);
});

console.info('RESTful API server started on: ');
