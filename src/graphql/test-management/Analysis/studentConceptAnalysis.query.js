import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import { LevelWiseTestWiseConceptAnalysisInputType, LevelWiseTestWiseConceptAnalysisForStudentProfileInputType } from './studentConceptAnalysis.type';

import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

function handleFetch(url, args, context) {
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
    })
    .catch((err) => {
      console.error(err);
      return new Error(err.message);
    });
}
export const StudentConceptAnalysisForStudentProfile = {
  args: {
    testId: { type: StringType, description: 'Unique identifier for the test' },
    testIds: { type: new List(StringType), description: 'Array of tests' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    args.studentId = context.user.username;
    const url = `${config.services.test}/api/v1/Analysis/student/studentConceptAnalysis`;
    return handleFetch(url, args, context);
  },
};

export const StudentConceptAnalysis = {
  args: {
    studentId: { type: new NonNull(StringType), description: 'studentId' },
    testId: { type: StringType, description: 'Unique identifier for the test' },
    ascendingOrder: { type: BooleanType, description: 'Sorting Order' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/studentConceptAnalysis`;
    return handleFetch(url, args, context);
  },
};

export const allStudentConceptAnalysis = {
  args: {
    limit: { type: IntType, description: 'number of imtems per page' },
    pageNumber: { type: IntType, description: 'unique identifier for page number' },
    testId: { type: StringType, description: 'Unique identifier for the test' },
    nodes: { type: new List(StringType), description: 'Unique identifier for the test'}
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/allStudentConceptAnalysis`;

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

export const LevelWiseTestWiseConceptAnalysis = {
  args: {
    input: {
      type: LevelWiseTestWiseConceptAnalysisInputType,
    },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/levelWiseTestWiseAnalysis`;

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

export const LevelWiseTestWiseConceptAnalysisForStudentProfile = {
  args: {
    input: {
      type: LevelWiseTestWiseConceptAnalysisForStudentProfileInputType,
    },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/student/levelWiseTestWiseAnalysis`;

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
  StudentConceptAnalysisForStudentProfile,
  StudentConceptAnalysis,
  allStudentConceptAnalysis,
};
