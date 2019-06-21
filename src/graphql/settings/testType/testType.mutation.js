/**
   @author Aditi
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';

import { CreateTestTypeInputType, OutputTestType,updateTestTypeInputType} from './testType.type';
const controller = require('../../../api/settings/testType/testType.controller');



export const createTestType = {
  args: {
    input: { type: CreateTestTypeInputType, description: 'TestType input type' },
  },
  type: OutputTestType,
  async resolve(obj, args, context) {
    return controller.createTestType(args.input, context);
  },
};


export const deleteTestType = {
  args: {
    code: { type: StringType, description: 'Internal code for test type' },
  },
  type: OutputTestType,
  async resolve(obj, args, context) {
    return controller.deleteTestType(args, context);
  },
};




export const updateTestType = {
  args: {
    input: { type: updateTestTypeInputType, description: 'TestType input type for update' },
  },
  type: OutputTestType,
  async resolve(obj, args, context) {
    return controller.updateTestType(args.input, context);
  },
};

export default{
  createTestType,
  deleteTestType,
  updateTestType,
};
