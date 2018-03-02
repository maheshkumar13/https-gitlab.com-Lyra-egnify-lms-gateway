/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';
import fetch from 'universal-fetch';

import TestPatternType from './testPattern.type';

const TestPattern = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(TestPatternType),
  async resolve() {
    const url = 'http://localhost:5001/api/testPattern';
    return fetch(url)
      .then(response => response.json())
      .then(json => json.testPatterns)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default TestPattern;
