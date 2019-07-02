
/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
    GraphQLInt as IntType,  
  } from 'graphql';
  
  import { TestPatternType } from './testPattern.type';
  const controller = require('../../../api/settings/testPattern/testPattern.controller');
  
  export const TestPatterns = {
    args: {
        testName: { type: StringType, description: 'Name of the test pattern' },
        totalQuestions: { type: IntType, description: 'Total Questions' },
        totalMarks: { type: IntType, description: 'Total Marks' },
        testType: { type: StringType, description: 'TYpe of test pattern' },
        markingSchemaType: { type: StringType, description: 'Marking Schema Type' },
    },
    type: new List(TestPatternType),
    async resolve(obj, args, context) {
      return controller.getTestPatterns(args, context);
    },
  };
  
  export default{
    TestPatterns,
  };
  