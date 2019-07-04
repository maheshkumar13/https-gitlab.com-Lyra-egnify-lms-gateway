import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLEnumType as EnumType,
} from 'graphql';

const controller = require('../../../api/settings/instituteHierarchy/instituteHierarchy.controller');


const anscetors = new ObjectType({
  name: 'AnscetorsType',
  fields: {
    child: { type: StringType },
    childCode: { type: StringType },
    parent: { type: StringType },
    parentCode: { type: StringType },
    level: { type: IntType },
    levelName: { type: IntType },
  },
});

export const InstituteHierarchyType = new ObjectType({
  name: 'InstituteHierarchyTree',
  fields: () => ({
    child: { type: new NonNull(StringType) },
    childCode: { type: new NonNull(StringType) },
    parent: { type: StringType },
    parentCode: { type: StringType },
    level: { type: IntType },
    levelName: { type: StringType },
    isLeafNode: { type: BooleanType },
    anscetors: { type: new List(anscetors) },
    description: { type: StringType },
    category: { type: StringType },
    next: {
      type: new List(InstituteHierarchyType),
      async resolve(obj, args, context) {
        const filters = {};
        filters.parentCode = obj.childCode;
        return controller.fetchNodes(args, context);
      },
    },
  }),
});

export const parentLevelEnum = new EnumType({
  name : "parentLevelEnum",
  values:{
    Country:{
      value: "Country"
    },
    Class:{
      value : "Class"
    },
    State:{
      value: "State"
    },
    City:{
      value: "City"
    },
    Branch:{
      value: "Branch"
    }
  }
} );

export const childLevelEnum = new EnumType({
  name : "childLevelEnum",
  values:{
    Section:{
      value: "Section"
    },
    Class:{
      value : "Class"
    },
    State:{
      value: "State"
    },
    City:{
      value: "City"
    },
    Branch:{
      value: "Branch"
    }
  }
} );
export const ChildListType = new ObjectType({
  name: "ChildListType",
  fields :{
    childCode: {type:StringType , description :'code of the child'},
    child: {type:StringType , description: 'name of the child'}
  }

});

export default {
  InstituteHierarchyType,
  ChildListType,
  parentLevelEnum,
  childLevelEnum,
};
