/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aakash Parsi
   @date   18/04/2019
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
} from 'graphql';

import InstituteHierarchyType from './instituteHierarchy.type';
const controller = require('../../../api/settings/instituteHierarchy/instituteHierarchy.controller');
const InstituteHierarchyFilterType = new InputType({
  name: 'InstituteHierarchyFilterType',
  fields: {
    parentCode: { type: StringType },
    childCode: { type: StringType },
    level: { type: IntType },
    ancestorCode: { type: StringType },
    levelName: { type: StringType},
  },
});

export const InstituteHierarchy = {
  args: {
    input: { type: InstituteHierarchyFilterType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args, context) {
    return controller.fetchNodes(args, context).then(nodesArray => {
      return nodesArray;
    });
  }
};

export default { InstituteHierarchy };
