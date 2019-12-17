/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,

} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

import { TextbookType , textbookCode } from './textbook.type';
const controller = require('../../../api/settings/textbook/textbook.controller');

export const Textbooks = {
  args: {
    code: { type: StringType, description: 'Internal code of textbook' },
    classCode: { type: StringType, description: 'childCode code of class' },
    subjectCode: { type: StringType, description: 'Internal code of subject' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientaion name' },
  },
  type: new List(TextbookType),
  async resolve(obj, args, context) {
    return controller.getTextbooks(args, context);
  },
};

const pageInfoListType = new ObjectType({
  name: 'pageInfoListType',
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


const TextbookOutputType = new ObjectType({
  name: 'TextbookOutputType',
  fields() {
    return {
      data: {
        type: new List(TextbookType),
      },
      pageInfo: {
        type: pageInfoListType,
      },
    };
  },
});

export const TextbookByPagination = {
  args: {
    code: { type: StringType, description: 'Internal code of textbook' },
    classCode: { type: StringType, description: 'childCode code of class' },
    subjectCode: { type: StringType, description: 'Internal code of subject' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientaion name' },
    pageNumber: { type: IntType, description: 'Page Number' },
    limit: { type: IntType, description: 'Records per page' },
  },
  type: TextbookOutputType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) args.pageNumber = 1;
    if (args.limit < 0) args.limit = 5;
    return controller.getTextbooksByPagination(args, context).then(([count, data]) => {
      console.log("i am inside query")
      const pageInfo = {};
      const resp = {};
      pageInfo.prevPage = true;
      pageInfo.nextPage = true;
      pageInfo.pageNumber = args.pageNumber;
      pageInfo.totalPages = args.limit && count ? Math.ceil(count / args.limit) : 1;
      pageInfo.totalEntries = count;

      resp.data = data;
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


    });
  },
};

export const TextbooksInfo = {
  type: GraphQLJSON,
  async resolve(obj , args , context){ //eslint-disable-line
    return controller.codeAndTextbooks(context);
  },
};


export default{
  Textbooks,
  TextbookByPagination,
  TextbooksInfo,
};
