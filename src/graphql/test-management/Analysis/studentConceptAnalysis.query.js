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
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';

export const StudentConceptAnalysis = {
  args: {
    studentId: { type: new NonNull(StringType), description: 'studentId' },
    testId: { type: StringType, description: 'Unique identifier for the test' },
  },
  type: GraphQLJSON,
  async resolve(obj, args) {
    const url = `${config.services.test}/api/v1/Analysis/studentConceptAnalysis`;
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
  StudentConceptAnalysis,
};
