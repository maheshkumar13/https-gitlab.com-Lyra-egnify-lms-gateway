/**
   @author Aslam Shaik
   @date    14/03/2018
   @version 1.0.0
*/

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
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';
import TestType from './test.type';


export const removeTest = {
  args: {
    testId: { type: new NonNull(StringType) },
  },
  type: TestType,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/test/remove`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json);
  },
};


export const createDummyTest = {
  args: {
    input: { type: GraphQLJSON },
  },
  type: TestType,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/test/create/dummy`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json);
  },
};

export const createDuplicateTest = {
  args: {
    testId: { type: new NonNull(StringType) },
  },
  type: TestType,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/test/create/duplicate`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json);
  },
};
export default{
  removeTest,
  createDummyTest,
  createDuplicateTest,
};
