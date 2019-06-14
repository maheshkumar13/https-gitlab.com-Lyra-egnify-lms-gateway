/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aakash Parsi
   @date   18/04/2019
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
  GraphQLEnumType as EnumType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import InstituteHierarchyType from './instituteHierarchy.type';

const controller = require('../../../api/settings/instituteHierarchy/instituteHierarchy.controller');

const CategoryEnumType = new EnumType({
  name: 'CategoryEnumTypeUpdate',
  values: {
    A: {
      value: 'A',
    },
    B: {
      value: 'B',
    },
    C: {
      value: 'C',
    },
  },
});

const UpdateCategoryInputType = new InputType({
  name: 'UpdateCategoryInputType',
  fields: {
    branch: { type: new NonNull(StringType) },
    category: { type: new NonNull(CategoryEnumType) },
  },
});

const UpdateCategoryInputDataType = new InputType({
  name: 'UpdateCategoryInputDataType',
  fields: {
    data: { type: new NonNull(new List(UpdateCategoryInputType))}
  },
});


export const updateCategory = {
  args: {
    input: { type: new NonNull(UpdateCategoryInputDataType) },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.updateCategory(args.input, context)
  },
};


export default { updateCategory };
