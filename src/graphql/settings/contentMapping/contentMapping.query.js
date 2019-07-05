/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aslam
   @date   25/04/2019
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  ContentMappingType,
  CmsCategoryStatsOutputType,
  CmsCategoryStatsInputType,
  CategoryWiseFilesOutputType,
  CategoryWiseFilesInputType,
  FileDataInputType,
  FileDataOutputType,
  CmsTopicLevelStatsInputType,
  TextbookBasedQuizInputType,
  TextbookBasedQuizOutputType
} from './contentMapping.type';

const controller = require('../../../api/settings/contentMapping/contentMapping.controller');


const pageInfoType = new ObjectType({
  name: 'ContentMappingPageInfoType',
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

const ContentMappingPaginatedType = new ObjectType({
  name: 'ContentMappingPaginatedType',
  fields() {
    return {
      data: {
        type: new List(ContentMappingType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});


export const ContentMapping = {
  args: {
    pageNumber: { type: IntType, description: 'Page Number' },
    limit: { type: IntType, description: 'Number of items per page' },
    textbookCode: { type: new NonNull(StringType), description: 'Internal code of Textbook ' },
    topicCode: { type: StringType, description: 'Internal code of Topic' },
    contentCategory: { type: new List(StringType), description: 'Category of the content' },
    contentType: { type: StringType, description: 'Content type' },
    resourceType: { type: new List(StringType), description: 'Type of resource' },
  },
  type: ContentMappingPaginatedType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    return controller.getContentMapping(args, context)
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
      });
  },
};

export const ContentMappingStats = {
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    return controller.getContentMappingStats(args, context);
  }
}

export const CmsCategoryStats = {
  args: {
    input: { type: CmsCategoryStatsInputType },
  },
  type: new List(CmsCategoryStatsOutputType),
  async resolve(obj, args, context) {
    return controller.getCMSCategoryStats(args, context)
      .then(async json => json);
  },
};

export const CategoryWiseFiles = {
  args: {
    input: { type: CategoryWiseFilesInputType },
  },
  type: CategoryWiseFilesOutputType,
  async resolve(obj, args, context) {
    return controller.getCategoryWiseFilesPaginated(args, context)
      .then(async json => json);
  },
};

export const FileData = {
  args: {
    input: { type: FileDataInputType },
  },
  type: new List(FileDataOutputType),
  async resolve(obj, args, context) {
    return controller.getFileData(args, context)
      .then(async json => json);
  },
};

export const CmsTopicLevelStats = {
  args: {
    input: { type: CmsTopicLevelStatsInputType },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    return controller.getCmsTopicLevelStats(args, context)
      .then(async json => json);
  },
};

export const TextbookBasedQuiz = {
  args: {
    input: { type: TextbookBasedQuizInputType },
  },
  type: new List(TextbookBasedQuizOutputType),
  async resolve(obj, args, context) {
    return controller.getTextbookBasedListOfQuizzes(args, context)
      .then(async json => json);
  },
};

export default {
  ContentMapping, CmsCategoryStats, CategoryWiseFiles, FileData, CmsTopicLevelStats, ContentMappingStats, TextbookBasedQuiz,
};
