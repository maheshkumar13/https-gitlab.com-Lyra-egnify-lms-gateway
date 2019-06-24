/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aakash Parsi
   @date   18/04/2019
   @version 1.0.0
*/

import {
  GraphQLNonNull as NonNull,
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
  GraphQLEnumType as EnumType,
} from 'graphql';

import { InstituteHierarchyType,ChildListType ,childLevelEnum,parentLevelEnum} from './instituteHierarchy.type';
import { LIST } from 'graphql/language/kinds';

const controller = require('../../../api/settings/instituteHierarchy/instituteHierarchy.controller');

const InstituteHierarchyFilterType = new InputType({
  name: 'InstituteHierarchyFilterType',
  fields: {
    parentCode: { type: StringType },
    childCode: { type: StringType },
    level: { type: IntType },
    ancestorCode: { type: StringType },
    levelName: { type: StringType },
  },
});

export const InstituteHierarchy = {
  args: {
    input: { type: InstituteHierarchyFilterType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args, context) {
    return controller.fetchNodes(args, context).then(nodesArray => nodesArray).catch(err => err);
  },
};

// ----------------Institute Hierarchy Paginated ---------------------------
const pageInfoType = new ObjectType({
  name: 'InstituteHierarcyPaginatedPageInfoType',
  fields() {
    return {
      pageNumber: {
        type: IntType,
      },
      nextPage: {
        type: BooleanType,
      },
      prevPage: {
        type: BooleanType,
      },
      totalPages: {
        type: IntType,
      },
      totalEntries: {
        type: IntType,
      },
    };
  },
});

const InstituteHierarchyPaginatedType = new ObjectType({
  name: 'InstituteHierarchyPaginatedType',
  fields() {
    return {
      data: {
        type: new List(InstituteHierarchyType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});

const CategoryEnumType = new EnumType({
  name: 'CategoryEnumType',
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


export const InstituteHierarchyPaginated = {
  args: {
    pageNumber: { type: IntType },
    limit: { type: IntType },
    childCodeList: { type: new List(StringType)},
    parentCodeList: { type: new List(StringType)},
    ancestorCodeList: { type: new List(StringType)},
    levelName: { type: new List(StringType)},
    level: { type: IntType },
    category: { type:  CategoryEnumType}
  },
  type: InstituteHierarchyPaginatedType,
  async resolve(obj, args, context) {
    if(!args.pageNumber) args.pageNumber = 1
    if(!args.limit) args.limit = 0
    return controller.getInstituteHierarchyPaginated(args, context)
      .then(async (json) => {
        if (json && json.data) {
          const pageInfo = {};
          const resp = {};
          pageInfo.prevPage = true;
          pageInfo.nextPage = true;
          pageInfo.pageNumber = args.pageNumber;
          pageInfo.totalPages = args.limit ? Math.ceil(json.count / args.limit) : 1;
          pageInfo.totalEntries = json.count;
          resp.data = json.data;

          if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
            throw new Error('Page Number is invalid');
          }
          if (args.pageNumber === pageInfo.totalPages) {
            pageInfo.nextPage = false;
          }
          if (args.pageNumber === 1) {
            pageInfo.prevPage = false;
          }
          resp.pageInfo = pageInfo;
          return resp;
        }
        return json;
      })
  },
};

export const ChildDataFromParent= {
  args: {
    parentLevelName: {type : new NonNull(parentLevelEnum)},
    childLevelName : {type : new NonNull(childLevelEnum)},
    parentCode : {type: new NonNull(StringType)},
  },
  type: new List(ChildListType),
  async resolve(obj, args , context) {
    return controller.getChildDataFromParent(args, context)    
  }
  
};

export default { InstituteHierarchy, InstituteHierarchyPaginated ,ChildDataFromParent};
