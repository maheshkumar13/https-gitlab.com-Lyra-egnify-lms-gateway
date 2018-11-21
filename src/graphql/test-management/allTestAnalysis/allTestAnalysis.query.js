import {
  // GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
  GraphQLInt as IntType,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';
import { AllTestAvergareResultsType, allTestResultsInputType } from './allTestAnalysis.type';

const pageInfoType = new ObjectType({
  name: 'AllTestResultsAnalysisPageInfoType',
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

// const testStatsType = new ObjectType({
//   name: 'AllTestResultsTestStatsType',
//   fields() {
//     return {
//       min: {
//         type: IntType,
//       },
//       max: {
//         type: IntType,
//       },
//       avg: {
//         type: IntType,
//       },
//     };
//   },
// });

export const AllTestAnalysisPaginatedType = new ObjectType({
  name: 'allTestResultAnalysisPaginatedType',
  fields() {
    return {
      page: {
        type: new List(AllTestAvergareResultsType),
      },
      pageInfo: {
        type: pageInfoType,
      },
      testStats: {
        type: new List(GraphQLJSON),
      },
    };
  },
});

// export

export const AllTestResultAnalysis = {
  args: {
    input: { type: allTestResultsInputType },
  },
  type: AllTestAnalysisPaginatedType,
  async resolve(obj, args, context) {
    if (!args.input.pageNumber) args.input.pageNumber = 1; // eslint-disable-line
    if (args.input.pageNumber < 1) {
      return new Error('Page Number must be positive');
    }
    args.input.filterAtDatabase = false; // eslint-disable-line
    const url = `${config.services.test}/api/v1/allTestsAnalysis/read/testResults`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json().then((json) => {
          // console.log("response", json.testStats);
          const data = {};
          data.page = json.data;
          data.testStats = json.testStats;
          const pageInfo = {};
          pageInfo.prevPage = true;
          pageInfo.nextPage = true;
          pageInfo.pageNumber = args.input.pageNumber;
          pageInfo.totalPages = Math.ceil(json.count / args.input.limit)
            ? Math.ceil(json.count / args.input.limit)
            : 1;
          pageInfo.totalEntries = json.count;

          if (args.input.pageNumber < 1 || args.input.pageNumber > pageInfo.totalPages) {
            return new Error('Page Number is invalid');
          }

          if (args.input.pageNumber === pageInfo.totalPages) {
            pageInfo.nextPage = false;
          }
          if (args.input.pageNumber === 1) {
            pageInfo.prevPage = false;
          }
          if (pageInfo.totalEntries === 0) {
            pageInfo.totalPages = 0;
          }
          data.pageInfo = pageInfo;
          return data;
        });
      })
      .catch(err => new Error(err.message));
  },
};

export default { AllTestResultAnalysis };
