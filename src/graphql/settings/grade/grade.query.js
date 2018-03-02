/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLList as List,
} from 'graphql';
import fetch from 'universal-fetch';

import GradeType from './grade.type';

const GradeSystem = {
  args: {
    testId: { type: StringType },
  },
  type: new List(GradeType),
  async resolve() {
    const url = 'http://localhost:5001/api/grade/read/system/';
    return fetch(url, { method: 'POST' })
      .then(response => response.json())
      .catch((err) => {
        console.error(err);
      });
  },
};

export default GradeSystem;
