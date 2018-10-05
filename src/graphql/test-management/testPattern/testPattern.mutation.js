

import {
  // GraphQLList as List,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  GraphQLString as StringType,
  // GraphQLObjectType as ObjectType,
  // GraphQLBoolean as BooleanType,
  // GraphQLEnumType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';


import { TestPatternSchemaType, InputTestPatternSchemaType } from './testPattern.type';

export const createTestPatternSchema = {
  args: {
    input: { type: new NonNull(InputTestPatternSchemaType) },
  },
  type: TestPatternSchemaType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/testPattern/createTestPattern`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      });
  },
};

export const removeTestPatternSchema = {
  args: {
    testName: { type: new NonNull(StringType), description: 'Name of the defined test pattern' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/testPattern/removeTestPattern`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      });
  },
};

export const updateTestPatternSchema = {
  args: {
    input: { type: new NonNull(InputTestPatternSchemaType) },
  },
  type: TestPatternSchemaType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/testPattern/updateTestPattern`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      });
  },
};

export default{
  createTestPatternSchema,
  updateTestPatternSchema,
  removeTestPatternSchema,
};
