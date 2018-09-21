import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  // GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLInputObjectType as InputObjectType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

export const StudentOverallAverageMarks = {
  args: {
    studentId: { type: new NonNull(StringType), description: 'studentId' },
    testType: { type: StringType, description: 'Type of test for which the average marks are needed' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/studentOverallAverageMarks`;

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
      .then(json => json);
  },
};

export const StudentOverallCWU = {
  args: {
    studentId: { type: new NonNull(StringType), description: 'studentId' },
    testType: { type: StringType, description: 'Type of test for which the average marks are needed' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/studentOverallCWU`;

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
      .then(json => json);
  },
};

export default {
  StudentOverallAverageMarks,
  StudentOverallCWU,
};
