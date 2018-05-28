/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';
import TestPatternType from './testPattern.type';

const TestPattern = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(TestPatternType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/testPattern`;
    return fetch(url, { method: 'POST' }, context)
      .then(response => response.json())
      .then(json => json.testPatterns)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default TestPattern;
