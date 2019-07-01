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

import { CreateTestTypeInputType, OutputTestType,UpdateTestTypeInputType} from './testType.type';
const controller = require('../../../api/settings/testType/testType.controller');



export const CreateTestType = {
  args: {
    input: { type: CreateTestTypeInputType, description: 'TestType input type' },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.createTestType(args.input, context);
  },
};

export const DeleteTestType = {
  args: {
    code: { type:new NonNull(StringType), description: 'Internal code for test type' },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.deleteTestType(args, context);
  },
};

export const UpdateTestType = {
  args: {
    input: { type: UpdateTestTypeInputType, description: 'TestType input type for update' },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.updateTestType(args.input, context);
  },
};

export default{
  CreateTestType,
  DeleteTestType,
  UpdateTestType,
};
