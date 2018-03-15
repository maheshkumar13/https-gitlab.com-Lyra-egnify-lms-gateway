/**
   @author Aslam Shaik
   @date    14/03/2018
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
  GraphQLEnumType,
} from 'graphql';

import fetch from 'universal-fetch';
import { config } from '../../../config/environment';
import TestType from './test.type';

const pageInfoType = new ObjectType({
  name: 'TestPageInfo',
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
      totalTests: {
        type: IntType,
      },
    };
  },
});

const TestsDetailsType = new ObjectType({
  name: 'TestsDetailsType',
  fields() {
    return {
      page: {
        type: new List(TestType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});
const StatusEnumType = new GraphQLEnumType({
  name: 'StatusEnumType',
  values: {
    draft: {
      value: "draft",
    },
    upcoming: {
      value: "upcoming",
    },
    inprogress: {
      value: "inprogress",
    },
    completed:{
      value: "completed"
    },
  },
});

export const Tests = {
  args: {
    testId: { type: StringType },
    regex: { type: StringType },
    status: { type: StatusEnumType },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
  type: TestsDetailsType,
  async resolve(obj, args) {
    // console.log(args);
    if(args.regex !== undefined)
      args.regex = args.regex.replace(/\s\s+/g, ' '); //eslint-disable-line
      if (args.regex === '' || args.regex === ' ') {
        return null;
    }
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (args.pageNumber < 1) {
      return new Error('Page Number must be positive');
    }
    const url = `${config.services.test}/api/v1/test`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .then((json) => {
        const data = {};
        data.page = json.tests;
        // console.log('getting data is',data)
        // console.log('cc', json.count);
        const pageInfo = {};
        pageInfo.prevPage = true;
        pageInfo.nextPage = true;
        pageInfo.pageNumber = args.pageNumber;
        pageInfo.totalPages = Math.ceil(json.count / args.limit)
          ? Math.ceil(json.count / args.limit)
          : 1;
        pageInfo.totalTests = json.count;

        if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
          return new Error('Page Number is invalid');
        }

        if (args.pageNumber === pageInfo.totalPages) {
          pageInfo.nextPage = false;
        }
        if (args.pageNumber === 1) {
          pageInfo.prevPage = false;
        }
        data.pageInfo = pageInfo;
        return data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default{
  Tests,
};
