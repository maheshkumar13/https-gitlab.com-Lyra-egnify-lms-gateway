/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  // GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import fetch from 'universal-fetch';
import GraphQLJSON from 'graphql-type-json';

import InstituteType from './institute.type';

export const createInstitute = {
  args: {
    instituteName: { type: new NonNull(StringType) },
    establishmentYear: { type: new NonNull(IntType) },
    academicSchedule: { type: new NonNull(GraphQLJSON) },
    registrationId: { type: new NonNull(StringType) },
    logoUrl: { type: new NonNull(StringType) },
    hierarchy: { type: GraphQLJSON },
  },
  type: InstituteType,
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/institute/enrollInstitute';

    const body = args;

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
    )
      .then(response => response.json())
      .then((json) => {
        console.error(json);
        return json;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default { createInstitute };
