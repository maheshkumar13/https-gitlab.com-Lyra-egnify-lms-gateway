import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
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

const InstituteHierarchyType = new ObjectType({
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


export default InstituteHierarchyType;
