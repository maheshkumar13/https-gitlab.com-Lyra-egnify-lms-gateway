
/**
   @author Sarvagya
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
  
  } from 'graphql';
  
  import { TestPatternInputType, TestPatternType , UpdateTestPatternInputType} from './testPattern.type';
  const controller = require('../../../api/settings/testPattern/testPattern.controller');
  
  export const createTestPattern = {
    args: {
      input: { type: TestPatternInputType, description: 'Marking Schema Input Type' },
    },
    type: TestPatternType,
    async resolve(obj, args, context) {
      return controller.createTestPattern(args.input, context);
    },
  };

  export const updateTestPattern = {
    args: {
      input: { type: TestPatternInputType, description: 'Textbook input type for update' },
    },
    type: TestPatternType,
    async resolve(obj, args, context) {
      return controller.updateTestPattern(args.input, context);
    },
  };

  export const deleteTestPattern = {
    args: {
      testName: { type: StringType, description: 'Internal code for text book' },
    },
    type: TestPatternType,
    async resolve(obj, args, context) {
      return controller.deleteTestPattern(args, context);
    },
  };
  
  export default{
    createTestPattern,
    updateTestPattern,
    deleteTestPattern
  };
  