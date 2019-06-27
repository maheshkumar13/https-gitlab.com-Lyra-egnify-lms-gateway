/**
   @description GraphQl mutationss for Packages.

   @author Aakash Parsi
   @date   27/06/2019
   @version 1.0.0
*/
import {
  GraphQLString as StringType,
  GraphQLInputObjectType as InputType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLList as List,
} from 'graphql';
import { CreatePackageInputType, CreatePackageOutputType,UpdatePackageInputType , PackageFeedbackInputType } from './package.type';

const controller = require('../../../api/settings/package/package.controller');

export const CreatePackage = {
  args: {
    input: { type: CreatePackageInputType },
  },
  type: CreatePackageOutputType,
  async resolve(obj, args, context) {
    return controller.createNewPackage(args.input, context);
  },
};

export const UpdatePackage = {
  args: {
    input: { type: UpdatePackageInputType },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.updatePackage(args.input, context);
  },
};

export const FeedbackPackage = {
  args: {
    input: { type: PackageFeedbackInputType },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.feedbackValidate(args.input, context);
  },
};

export default { CreatePackage,UpdatePackage,FeedbackPackage };
