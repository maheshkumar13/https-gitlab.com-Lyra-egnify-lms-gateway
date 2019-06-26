
/**
   @author Sarvagya Bhargava
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
  
  } from 'graphql';
  
  import { TestInputType , TestType} from './tests.type';
  const controller = require('../../../api/tests/tests/tests.controller')
  
  export const createTest = {
    args: {
      input: { type: TestInputType, description: 'Test input type' },
    },
    type: TestType,
    async resolve(obj, args, context) {
      return controller.createTest(args.input, context);
    },
  };
  
  
  export default{
    createTest,
  };
  