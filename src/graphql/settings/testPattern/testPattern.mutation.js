/**
   @author Aslam Shaik
   @date    02/03/2018
   @version 1.0.0
*/

import {
  // GraphQLList as List,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  GraphQLString as StringType,

} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';
import TestPatternType from './testPattern.type';

export const createTestPattern = {
  args: {
    name: { type: new NonNull(StringType) },
    patternCode: { type: new NonNull(StringType) },
    description: { type: StringType },
  },
  type: TestPatternType,
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/testPattern/create`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => { //eslint-disable-line
        // console.log(errjson);
      });
  },
};

export const updateTestPattern = {
  args: {
    code: { type: new NonNull(StringType) },
    name: { type: StringType },
    patternCode: { type: StringType },
  },
  type: TestPatternType,
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/testPattern/update/`.concat(args.code);
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};

export const removeTestPattern = {
  args: {
    code: { type: new NonNull(StringType) },
  },
  type: TestPatternType,
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/testPattern/remove/`.concat(args.code);
    return fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};


export default{
  createTestPattern,
  updateTestPattern,
  removeTestPattern,
};
