/**
   @author Aslam Shaik
   @date    02/03/2018
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';
import StudentType from './student.type';

const sampleStudentType = new ObjectType({
  name: 'downloadStudentSampleType',
  fields: {
    csvString: { type: StringType },
  },
});

const pageInfoType = new ObjectType({
  name: 'StudentpageInfo',
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

const studentDetailsType = new ObjectType({
  name: 'StudentDetailsType',
  fields() {
    return {
      page: {
        type: new List(StudentType),
      },
      hierarchy: {
        type: GraphQLJSON,
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});

export const Students = {
  args: {
    egnifyId: { type: StringType },
    sortby: { type: StringType },
    order: { type: IntType },
    pageNumber: { type: IntType },
    limit: { type: IntType },
    regex: { type: StringType },
    childCode: { type: StringType },
    filters: { type: GraphQLJSON },
    studentIdAndNameOnly: { type: BooleanType },
  },
  type: studentDetailsType,
  async resolve(obj, args, context) {
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    // if (!args.limit) args.limit = 100; // eslint-disable-line
    if (args.pageNumber < 1) {
      return new Error('Page Number must be positive');
    }
    if (args.regex !== undefined) {
      args.regex = args.regex.replace(/\s\s+/g, ' ').trim(); //eslint-disable-line
      if (args.regex === '') {
        args.regex = undefined; //eslint-disable-line
      }
    }
    if (args.filters !== undefined) {
      args.filters = JSON.stringify(args.filters); // eslint-disable-line
    }

    const url = `${config.services.settings}/api/student/students`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json().then((json) => {
          const data = {};
          data.page = json.students;

          data.hierarchy = json.hierarchy;

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
          data.pageInfo = pageInfo;
          return data;
        });
      })
      .catch((err) => {
        console.error(err);
        return new Error(err.message);
      });
  },
};
export const downloadStudentSample = {

  type: sampleStudentType,
  async resolve(obj, args, context) { // eslint-disable-line

    const url = `${config.services.settings}/api/student/downloadStudentSample`;
    return fetch(url, {
      method: 'POST',
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const StudentUniqueValues = {
  args: {
    key: { type: StringType },
    level: { type: IntType },
    childCode: { type: new List(StringType) },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) { // eslint-disable-line

    const url = `${config.services.settings}/api/student/getUniqueValues`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const StudentsByLastNode = {
  args: {
    list: { type: new NonNull(new List(StringType)) },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) { // eslint-disable-line

    args.list = JSON.stringify(args.list) // eslint-disable-line
    const url = `${config.services.settings}/api/student/numberOfStudentsByLastNode`;
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
      .catch(err =>
        new Error(err.message));
  },
};

export default{
  downloadStudentSample,
  StudentUniqueValues,
  Students,
  StudentsByLastNode,
};
