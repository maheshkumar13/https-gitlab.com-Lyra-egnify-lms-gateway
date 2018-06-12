/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
  GraphQLInt as IntType,
  GraphQLObjectType as ObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { CommonAnalysisType, QuestionErrorAnalysisType, GenerateAnalysisReturnType, FilterInputType, StudentPerformanceTrendAnalysisType } from './ga.type';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

// const CommonAnalysis = {
//   args: {
//     testId: { type: StringType },
//   },
//   type: new List(CommonAnalysisType),
//   async resolve(obj, args) {
//     const gaBody = JSON.stringify(args);//eslint-disable-line
//
//     const url = 'https://egnify-product.appspot.com/api/v1/masterResult/read';
//     return fetch(url, { method: 'POST', body: gaBody, headers: { 'Content-Type': 'application/json' } })
//       .then((response) => {
//         if (response.status >= 400) {
//           return new Error(response.statusText);
//         }
//         return response.json();
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   },
// };


const pageInfoType = new ObjectType({
  name: 'CommonAnalysisPageInfo',
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
const CommonAnalysisDetailsType = new ObjectType({
  name: 'CommonAnalysisDetailsType',
  fields() {
    return {
      page: {
        type: new List(CommonAnalysisType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});


export const CommonAnalysis = {
  args: {
    testIds: { type: new List(StringType) },
    studentId: { type: StringType },
    filter: { type: new List(FilterInputType) },
  },
  type: new List(CommonAnalysisType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/masterResult/read/withMultipleTestIds`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },
};

export const CommonAnalysisPaginated = {
  args: {
    testIds: { type: new List(StringType) },
    studentId: { type: StringType },
    filter: { type: new List(FilterInputType) },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
  type: CommonAnalysisDetailsType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (args.pageNumber < 1) {
      return new Error('Page Number must be positive');
    }
    const url = `${config.services.test}/api/v1/masterResult/read/withMultipleTestIdsPaginated`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then((json) => {
        const data = {};
        data.page = json.data;
        // console.error(data.page);
        // console.log('getting data is',data)
        // console.log('cc', json.count);
        const pageInfo = {};
        pageInfo.prevPage = true;
        pageInfo.nextPage = true;
        pageInfo.pageNumber = args.pageNumber;
        pageInfo.totalPages = Math.ceil(json.count / args.limit)
          ? Math.ceil(json.count / args.limit)
          : 1;
        pageInfo.totalEntries = json.count;

        if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
          return new Error('Page Number is invalid');
        }

        if (args.pageNumber === pageInfo.totalPages) {
          pageInfo.nextPage = false;
        }
        if (args.pageNumber === 1) {
          pageInfo.prevPage = false;
        }
        if (pageInfo.totalEntries === 0) {
          pageInfo.totalPages = 0;
        }
        data.pageInfo = pageInfo;
        return data;
      })
      .catch(err => new Error(err.message));
  },
};

export const MarkAnalysisGraphData = {
  args: {
    testIds: { type: new List(StringType), description: 'List of strings with testIds' },
    studentIds: { type: new List(StringType), description: 'List of strings with studentIds' },
    divisons: { type: IntType, description: 'Number of divisions' },
    start: { type: IntType, description: 'Starting point on x-axis ' },
    end: { type: IntType, description: 'End point on description' },
    precision: { type: IntType, description: 'Max number of decimal places ' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/masterResult/read/markAnalysisGraphData`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const MarkAnalysisGraphDataV2 = {
  args: {
    testIds: { type: new List(StringType), description: 'List of strings with testIds' },
    studentIds: { type: new List(StringType), description: 'List of strings with studentIds' },
    divisons: { type: IntType, description: 'Number of divisions' },
    start: { type: IntType, description: 'Starting point on x-axis ' },
    end: { type: IntType, description: 'End point on description' },
    precision: { type: IntType, description: 'Max number of decimal places ' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/masterResult/read/markAnalysisGraphDataV2`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};
export const MarksDistributionAnalysis = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Test Id of a particular test' },
    division: { type: new NonNull(StringType), description: 'No of division of total marks. Should be less than total Marks' },
    level: { type: new NonNull(StringType), description: 'Level No of the Hierarchy' },
    campusFilter: { type: new List(StringType), description: 'Internal Code of a particular Hierarchy Node' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/reports/generateMarkDistributionReport`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },


};

export const QuestionErrorAnalysis = {
  args: {
    testId: { type: new NonNull(StringType) },
    filter: { type: new List(FilterInputType) },
  },
  type: QuestionErrorAnalysisType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/reports/questionErrorCount`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },
};

export const StudentPerformanceTrendAnalysis = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Test Id ' },
    filter: { type: new List(FilterInputType) },

  },
  type: StudentPerformanceTrendAnalysisType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/reports/generateTrendReport`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

const StudentPerformanceTrendAnalysisDetailsType = new ObjectType({
  name: 'StudentPerformanceTrendAnalysisDetailsType',
  fields() {
    return {
      page: {
        type: StudentPerformanceTrendAnalysisType,
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});
export const StudentPerformanceTrendAnalysisPaginated = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Test Id ' },
    filter: { type: new List(FilterInputType) },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
  type: StudentPerformanceTrendAnalysisDetailsType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (args.pageNumber < 1) {
      return new Error('Page Number must be positive');
    }
    const url = `${config.services.test}/api/v1/reports/generateTrendReportPaginated`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then((json) => {
        const data = {};
        data.page = json.data;
        // console.error(data.page);
        // console.log('getting data is',data)
        // console.log('cc', json.count);
        const pageInfo = {};
        pageInfo.prevPage = true;
        pageInfo.nextPage = true;
        pageInfo.pageNumber = args.pageNumber;
        pageInfo.totalPages = Math.ceil(json.count / args.limit)
          ? Math.ceil(json.count / args.limit)
          : 1;
        pageInfo.totalEntries = json.count;

        if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
          return new Error('Page Number is invalid');
        }

        if (args.pageNumber === pageInfo.totalPages) {
          pageInfo.nextPage = false;
        }
        if (args.pageNumber === 1) {
          pageInfo.prevPage = false;
        }
        if (pageInfo.totalEntries === 0) {
          pageInfo.totalPages = 0;
        }
        data.pageInfo = pageInfo;
        return data;
      })
      .catch(err => new Error(err.message));
  },


};

export const GenerateAnalysis = {
  args: {
    testId: { type: new NonNull(StringType) },
    start: { type: new NonNull(BooleanType) },
  },
  type: GenerateAnalysisReturnType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/perform/ga`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const GenerateAnalysisv2 = {
  args: {
    testId: { type: new NonNull(StringType) },
    start: { type: new NonNull(BooleanType) },
  },
  type: GenerateAnalysisReturnType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/perform/gav2`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};


export default {
  CommonAnalysis,
  CommonAnalysisPaginated,
  QuestionErrorAnalysis,
  GenerateAnalysis,
  MarkAnalysisGraphData,
  MarkAnalysisGraphDataV2,
};
