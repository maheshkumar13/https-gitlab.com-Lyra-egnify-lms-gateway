import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
  GraphQLEnumType as EnumType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLDate from 'graphql-date';

import { TimeAnalysisType, TimeAnalysisHeadersType, TimeAnalysisListType } from './timeAnalysis.type';

const controller = require('../../../api/analysis/timeAnalysis/timeAnalysis.controller');

const pageInfoType = new ObjectType({
  name: 'TimeAnalysisgPageInfoType',
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

const TimeAnalysisPaginatedType = new ObjectType({
  name: 'TimeAnalysisPaginatedType',
  fields() {
    return {
      data: {
        type: new List(TimeAnalysisType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});

export const TimeAnalysis = {
  args: {
    studentId: { type: StringType, description: 'Unique Identifier for the student' },
    isStudent: { type: BooleanType, description: 'true for students data' },
    fullData: { type: BooleanType, description: 'full student analysis' },
    class: { type: StringType, description: 'Class name' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation' },
    startDate: { type: GraphQLDate, description: 'Start date' },
    endDate: { type: GraphQLDate, description: 'End date' },
    pageNumber: { type: IntType, description: 'Page number' },
    limit: { type: IntType, description: 'Number of docs per page' },
  },
  type: TimeAnalysisPaginatedType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) throw new Error('Page Number is invalid');
    if (args.limit < 0) throw new Error('Invalid limit');
    return controller.getTimeAnalysis(args, context).then(([count, data]) => {
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

export const TimeAnalysisHeaders = {
  args: {
    class: { type: StringType, description: 'Class name' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation' },
    subject: { type: StringType, description: 'Subject name' },
    startDate: { type: GraphQLDate, description: 'Start date' },
    endDate: { type: GraphQLDate, description: 'End date' },
  },
  type: TimeAnalysisHeadersType,
  async resolve(obj, args, context) {
    return controller.getTimeAnalysisHeaders(args, context);
  },
};

const pageInfoListType = new ObjectType({
  name: 'TimeAnalysisgFilterPageInfoType',
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

const TimeAnalysisPaginatedListType = new ObjectType({
  name: 'TimeAnalysisPaginatedListType',
  fields() {
    return {
      data: {
        type: new List (TimeAnalysisListType),
      },
      pageInfo: {
        type: pageInfoListType,
      },
    };
  },
});

export const SortEnumType = new EnumType({ // eslint-disable-line
  name: 'SortEnumType',
  values: {
    ASC: {
      value:1,
    },
    DESC: {
      value: -1,
    },
  },
});

export const SortByEnumType = new EnumType({ // eslint-disable-line
  name: 'SortByEnumType',
  values: {
    studentName:{},
    date:{}
  },
});

export const TimeAnalysisStudentsList = {
  args: {
    class: { type: StringType, description: 'Class name' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation' },
    startDate: { type: GraphQLDate, description: 'Start date' },
    endDate: { type: GraphQLDate, description: 'End date' },
    pageNumber: { type: IntType, description: 'Page number' },
    limit: { type: IntType, description: 'Number of docs per page' },
    sortBy: { type: SortByEnumType, description: 'Sort By' },
    sortType:{type: SortEnumType , description: 'Sort Type' },
    sortValue: { type: GraphQLDate, description: 'Sort Value' },
  },
  type: TimeAnalysisPaginatedListType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) throw new Error('Page Number is invalid');
    if (args.limit < 0) throw new Error('Invalid limit');
    return controller.getTimeAnalysisStudentsList(args, context).then(([count, data]) => {
      const pageInfo = {};
      const resp = {};
      pageInfo.prevPage = true;
      pageInfo.nextPage = true;
      pageInfo.pageNumber = args.pageNumber;
      pageInfo.totalPages = args.limit && count ? Math.ceil(count / args.limit) : 1;
      pageInfo.totalEntries = count;
      resp.data = data;
      //console.log("datann : ",data)
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
     // console.log("resp : ", resp)
      return resp;
    });
  },
};

export default {
  TimeAnalysis,
  TimeAnalysisHeaders,
  TimeAnalysisStudentsList,
};
