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

import GraphQLJSON from 'graphql-type-json';
import { BehaviourDataType } from './studentBehaviourData.type';

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

export const BehaviourDataForStudentProfile = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Unique identifier for the test' },
  },
  type: new List(BehaviourDataType),
  async resolve(obj, args, context) {
    args.studentId = context.user.username;
    const url = `${config.services.test}/api/v1/testStudentSnapshot/getBehaviourData`;
    return handleFetch(url, args, context);
  },
};

export const BehaviourData = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Unique identifier for the test' },
    studentId: { type: new NonNull(StringType), description: 'Unique identifier for the test' },
  },
  type: new List(BehaviourDataType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/testStudentSnapshot/getBehaviourData`;
    return handleFetch(url, args, context);
  },
};

export default { BehaviourDataForStudentProfile, BehaviourData }
