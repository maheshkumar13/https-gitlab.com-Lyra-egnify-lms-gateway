/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
} from 'graphql';
import fetch from 'universal-fetch';
import GraphQLJSON from 'graphql-type-json';

import { CommonAnalysisType, QuestionErrorAnalysisType, GenerateAnalysisReturnType, FilterInputType } from './ga.type';

import { config } from '../../../config/environment';

// const CommonAnalysis = {
//   args: {
//     testId: { type: StringType },
//   },
//   type: new List(CommonAnalysisType),
//   async resolve(obj, args) {
//     const gaBody = JSON.stringify(args);//eslint-disable-line
//
//     const url = 'https://egnify-product.appspot.com/api/v1/masterResult/read';
//     return fetch(url, { method: 'POST', body: gaBody, headers: { 'Content-Type': 'application/json' } })
//       .then((response) => {
//         if (response.status >= 400) {
//           return new Error(response.statusText);
//         }
//         return response.json();
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   },
// };

export const CommonAnalysis = {
  args: {
    testIds: { type: new List(StringType) },
    studentId: { type: StringType },
    filter: { type: new List(FilterInputType) },
  },
  type: new List(CommonAnalysisType),
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/masterResult/read/withMultipleTestIds`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },
};

export const MarksDistributionAnalysis = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Test Id of a particular test' },
    division: { type: new NonNull(StringType), description: 'No of division of total marks. Should be less than total Marks' },
    level: { type: new NonNull(StringType), description: 'Level No of the Hierarchy' },
    campusFilter: { type: new List(StringType), description: 'Internal Code of a particular Hierarchy Node' },
  },
  type: GraphQLJSON,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/reports/generateMarkDistributionReport`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },


};

export const QuestionErrorAnalysis = {
  args: {
    testId: { type: new NonNull(StringType) },
    filter: { type: new List(FilterInputType) },
  },
  type: QuestionErrorAnalysisType,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/reports/questionErrorCount`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },
};

export const StudentPerformanceTrendAnalysis = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Test Id ' },
    filter: { type: new List(FilterInputType) },

  },
  type: GraphQLJSON,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/reports/generateTrendReport`;
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
      .catch(err => new Error(err.message));
  },


};

export const GenerateAnalysis = {
  args: {
    testId: { type: new NonNull(StringType) },
    start: { type: new NonNull(BooleanType) },
  },
  type: GenerateAnalysisReturnType,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/test/perform/ga`;
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
      .catch(err => new Error(err.message));
  },
};

export default {
  CommonAnalysis,
  QuestionErrorAnalysis,
  GenerateAnalysis,
};
