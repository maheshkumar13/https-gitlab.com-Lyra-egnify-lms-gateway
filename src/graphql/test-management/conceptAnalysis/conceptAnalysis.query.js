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
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLInputObjectType as InputObjectType,
} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

import { ConceptAnalysisType } from './conceptAnalysis.type';

export const ConceptAnalysis = {
  args: {
    testId: { type: new NonNull(StringType) },
    nodes: { type: new List(StringType) },
  },
  type: ConceptAnalysisType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/conceptAnalysis/read`;
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

export const ConceptAnalysisAllTests = {
  args: {
    testIds: { type: new List(StringType) },
    nodes: { type: new List(StringType) },
    testType: { type: StringType },
  },
  type: ConceptAnalysisType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/conceptAnalysis/read/allTests`;
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

export const ConceptAnalysisAllTestsStudentWise = {
  args: {
    testIds: { type: new List(StringType) },
    nodes: { type: new List(StringType) },
    testType: { type: StringType },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
  type: ConceptAnalysisType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/conceptAnalysis/read/studentWise/allTests`;
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

export default{
  ConceptAnalysis, ConceptAnalysisAllTests, ConceptAnalysisAllTestsStudentWise,
};
