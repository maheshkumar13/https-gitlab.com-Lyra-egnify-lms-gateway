import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  // GraphQLInt as IntType,
  // GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLInputObjectType as InputObjectType,
} from 'graphql';


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
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/Analysis/studentConceptAnalysis`;
    return handleFetch(url, args, context);
  },
};

export default{
  StudentConceptAnalysisForStudentProfile,
  StudentConceptAnalysis,
};
