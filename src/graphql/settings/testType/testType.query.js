import {
    GraphQLList as List,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
  
  } from 'graphql';
  
import GraphQLJSON from 'graphql-type-json';
import { OutputTestType } from './testType.type';
const controller = require('../../../api/settings/testType/testType.controller');

export const TestType = {
  args: {
    classCode: { type: StringType, description: 'Class for which test has to be made' },
    educationType: { type: StringType, description: 'Competitive or School/College Type'},
  },
  type: new List(OutputTestType),
  async resolve(obj, args, context) {
    return controller.getTestType(args, context);
  },
};

export default{
  TestType
};