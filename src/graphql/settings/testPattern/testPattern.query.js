/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';
import TestPatternType from './testPattern.type';

const TestPattern = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(TestPatternType),
  async resolve() {
    const url = `${config.services.settings}/api/testPattern`;
    return fetch(url)
      .then(response => response.json())
      .then(json => json.testPatterns)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default TestPattern;
