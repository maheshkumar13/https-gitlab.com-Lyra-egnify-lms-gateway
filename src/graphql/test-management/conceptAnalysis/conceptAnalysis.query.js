/**
@author Aslam Shaik
@data    22/05/2018
@version 1.0.0
*/

import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  // GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLInputObjectType as InputObjectType,
} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';

import { ConceptAnalysisType } from './conceptAnalysis.type';

export const ConceptAnalysis = {
  args: {
    testId: { type: new NonNull(StringType) },
    nodes: { type: new List(StringType) },
  },
  type: ConceptAnalysisType,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/conceptAnalysis/read`;
    // console.log('url is', url);
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
  ConceptAnalysis,
};
