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

import { TextbookType, ChapterWiseTextbookListOutputType} from './textbook.type';
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
    if (!args.limit) args.limit = 5; // eslint-disable-line
    if (args.pageNumber < 1) args.pageNumber = 1;
    if (args.limit < 0) args.limit = 5;
    return controller.getTextbooksByPagination(args, context)
    .then(async (json) => {
      console.log("i am inside query")

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

export const TextbooksInfo = {
  type: GraphQLJSON,
  async resolve(obj , args , context){ //eslint-disable-line
    return controller.codeAndTextbooks(context);
  },
};

const ChapterWiseTextbookOutputType = new ObjectType({
  name: 'ChapterWiseTextbookOutputType',
  fields() {
    return {
      data: {
        type: new List(ChapterWiseTextbookListOutputType),
      },
      pageInfo: {
        type: pageInfoListType,
      },
    };
  },
});

export const ChapterWiseTextbookList = {
  args: {
    classCode: { type: new List(StringType), description: 'Class code' },
    subjectCode: { type: new List(StringType), description: 'Subject code' },
    textbookCode: { type: new List(StringType), description: 'textbook code' },
    pageNumber: { type: IntType, description: 'Page number' },
    limit: { type: IntType, description: 'Number of docs per page' },
  },
  type: ChapterWiseTextbookOutputType,
  async resolve(obj, args, context) {
    if (args.pageNumber < 1 || !args.pageNumber) args.pageNumber = 1;
    if (args.limit < 0 || !args.limit) args.limit = 10;
    return controller.getChapterWiseTextbookList(args, context).then(([count, data]) => {
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

export default{
  Textbooks,
  TextbookByPagination,
  TextbooksInfo,
  ChapterWiseTextbookList,
};
