/* eslint-disable no-unused-vars */
/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLEnumType as EnumType,
  GraphQLNonNull as NonNull,


} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

import { TextbookType, ChapterWiseTextbookListOutputType } from './textbook.type';

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

export const TextbooksInfo = {
  type: GraphQLJSON,
  async resolve(obj, args, context) { //eslint-disable-line
    return controller.codeAndTextbooks(context);
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
    className: { type: new List(StringType), description: 'Class name' },
    subjectName: { type: new List(StringType), description: 'Subject name' },
    bookName: { type: new List(StringType), description: 'Book Name' },
    pageNumber: { type: IntType, description: 'Page number' },
    limit: { type: IntType, description: 'Number of docs per page' },
  },
  type: ChapterWiseTextbookOutputType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) throw new Error('Page Number is invalid');
    if (args.limit < 0) throw new Error('Invalid limit');
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


export default {
  Textbooks,
  TextbooksInfo,
  ChapterWiseTextbookList,
};
