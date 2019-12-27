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

import { TimeAnalysisType, TimeAnalysisHeadersType, TimeAnalysisListType, TimeAnalysisListByDayType, TimeAnalysisHeadersTypev2 } from './timeAnalysis.type';
import { validateAccess } from '../../../utils/validator';

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

export const StudentLevelTimeAnalysis = {
  args: {
    studentId: { type: StringType, description: 'Unique Identifier for the student' },
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
    const validRoles = ['LMS_ENGAGEMENT_VIEWER'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) throw new Error('Page Number is invalid');
    if (args.limit < 0) throw new Error('Invalid limit');
    return controller.getStudentLevelTimeAnalysis(args, context).then(([count, data]) => {
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
}

export const TeacherLevelTimeAnalysis = {
  args: {
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
    const validRoles = ['CMS_ENGAGEMENT_VIEWER'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) throw new Error('Page Number is invalid');
    if (args.limit < 0) throw new Error('Invalid limit');
    return controller.getTeacherLevelTimeAnalysis(args, context).then(([count, data]) => {
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
}
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
    const validRoles = ['CMS_ENGAGEMENT_VIEWER'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    return controller.getTimeAnalysisHeaders(args, context);
  },
};

export const TimeAnalysisHeadersv2 = {
  args: {
    class: { type: StringType, description: 'Class name' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation' },
    section: { type: StringType, description: 'Section' },
    startDate: { type: GraphQLDate, description: 'Start date' },
    endDate: { type: GraphQLDate, description: 'End date' },
  },
  type: TimeAnalysisHeadersTypev2,
  async resolve(obj, args, context) {
    const validRoles = ['CMS_ENGAGEMENT_VIEWER'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    return controller.getTimeAnalysisHeadersv2(args, context);
  },
};

const pageInfoListByDayType = new ObjectType({
  name: 'pageInfoListByDayType',
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
        type: new List(TimeAnalysisListType),
      },
      pageInfo: {
        type: pageInfoListByDayType,
      },
    };
  },
});

export const SortEnumType = new EnumType({ // eslint-disable-line
  name: 'SortEnumType',
  values: {
    ASC: {
      value: 1,
    },
    DESC: {
      value: -1,
    },
  },
});

export const SortByEnumType = new EnumType({ // eslint-disable-line
  name: 'SortByEnumType',
  values: {
    studentName: {},
    date: {}
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
    sortType: { type: SortEnumType, description: 'Sort Type' },
    sortValue: { type: GraphQLDate, description: 'Sort Value' },
  },
  type: TimeAnalysisPaginatedListType,
  async resolve(obj, args, context) {
    const validRoles = ['CMS_ENGAGEMENT_VIEWER'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
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
      
      return resp;
    });
  },
};


/************************TimeAnalysisStudentsListByDay****************************/


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

const TimeAnalysisPaginatedListByDayType = new ObjectType({
  name: 'TimeAnalysisPaginatedListByDayType',
  fields() {
    return {
      data: {
        type: new List(TimeAnalysisListByDayType),
      },
      pageInfo: {
        type: pageInfoListType,
      },
    };
  },
});
export const SortByDayValueType = new EnumType({ // eslint-disable-line
  name: 'SortByDayValueType',
  values: {
    Sun: {
      value: 1,
    },
    Mon: {
      value: 2,
    },
    Tue: {
      value: 3,
    },
    Wed: {
      value: 4,
    },
    Thu: {
      value: 5,
    },
    Fri: {
      value: 6,
    },
    Sat: {
      value: 7,
    },
  },
});
export const SortTypeByDayEnumType = new EnumType({ // eslint-disable-line
  name: 'SortTypeByDayEnumType',
  values: {
    ASC: {
      value: 1,
    },
    DESC: {
      value: -1,
    },
  },
});

export const SortByDayEnumType = new EnumType({ // eslint-disable-line
  name: 'SortByDayEnumType',
  values: {
    studentName: {},
    day: {},
    totalTimeSpent: {},
  
  },
});
export const TimeAnalysisStudentsListByDay = {
  args: {
    class: { type: StringType, description: 'Class name' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation' },
    startDate: { type: GraphQLDate, description: 'Start date' },
    endDate: { type: GraphQLDate, description: 'End date' },
    pageNumber: { type: IntType, description: 'Page number' },
    limit: { type: IntType, description: 'Number of docs per page' },
    sortBy: { type: SortByDayEnumType, description: 'Sort By' },
    sortType: { type: SortTypeByDayEnumType, description: 'Sort Type' },
    sortValue: { type: SortByDayValueType, description: 'Sort Value' },
  },
  type: TimeAnalysisPaginatedListByDayType,
  async resolve(obj, args, context) {
    const validRoles = ['CMS_ENGAGEMENT_VIEWER'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 0; // eslint-disable-line
    if (args.pageNumber < 1) throw new Error('Page Number is invalid');
    if (args.limit < 0) throw new Error('Invalid limit');
    return controller.getTimeAnalysisStudentsListByDay(args, context).then(([count, data]) => {
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

      return resp;
    });
  },
};
/*******************************************************************************/
export default {
  TimeAnalysis,
  TimeAnalysisHeaders,
  TimeAnalysisStudentsList,
  TimeAnalysisStudentsListByDay,
  TimeAnalysisHeadersv2
};






