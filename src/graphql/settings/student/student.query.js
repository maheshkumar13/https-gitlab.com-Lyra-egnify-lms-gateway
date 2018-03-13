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
import fetch from 'universal-fetch';
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
      totalStudents: {
        type: IntType,
      },
    };
  },
});

const studentDetailsType = new ObjectType({
  name: 'StudentDetailsType',
  fields() {
    return {
      students: {
        type: new List(StudentType),
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
  },
  type: studentDetailsType,
  async resolve(obj, args) {
    // console.log(args);
    if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
    if (!args.limit) args.limit = 100; // eslint-disable-line
    if (args.pageNumber < 1) {
      return new Error('Page Number must be positive');
    }
    const url = `${config.services.settings}/api/student/students`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .then((json) => {
        const data = {};
        data.students = json.students;
        // console.log('cc', json.count);
        const pageInfo = {};
        pageInfo.prevPage = true;
        pageInfo.nextPage = true;
        pageInfo.pageNumber = args.pageNumber;
        pageInfo.totalPages = Math.ceil(json.count / args.limit)
          ? Math.ceil(json.count / args.limit)
          : 1;
        pageInfo.totalStudents = json.count;

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
export const downloadStudentSample = {

  type: sampleStudentType,
  async resolve(obj, args) { // eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/student/downloadStudentSample`;
    return fetch(url, {
      method: 'POST',
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const studentSearch = {
  args: {
    regex: { type: new NonNull(StringType) },
    limit: { type: IntType },
  },
  type: new List(StudentType),
  async resolve(obj, args) { // eslint-disable-line
    args.regex = args.regex.replace(/\s\s+/g, ' '); //eslint-disable-line
    if (args.regex === '' || args.regex === ' ') {
      return null;
    }
    const url = `${config.services.settings}/api/student/search`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default{
  downloadStudentSample,
  Students,
  studentSearch,
};
