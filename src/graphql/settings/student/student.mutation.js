/**
   @author Aslam Shaik
   @date    02/03/2018
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLEnumType,
  GraphQLInputObjectType as InputObjectType,

} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';
import StudentType from './student.type';

const GraphQLDate = require('graphql-date');

const GenderEnumType = new GraphQLEnumType({ // eslint-disable-line
  name: 'GenderEnumType',
  values: {
    Male: {
      value: 'M',
    },
    Female: {
      value: 'F',
    },
  },
});

export const createStudent = {
  args: {
    studentName: { type: new NonNull(StringType) },
    studentId: { type: new NonNull(StringType) },
    hierarchy: { type: GraphQLJSON },
    fatherName: { type: StringType },
    phone: { type: StringType },
    email: { type: StringType },
    gender: { type: StringType },
    category: { type: StringType },
    dob: { type: GraphQLDate },
  },
  type: StudentType,
  async resolve(obj, args, context) {
    args.hierarchy = JSON.stringify(args.hierarchy);//eslint-disable-line
    const url = `${config.services.settings}/api/student/create/student`;
    return fetch(
      url, {
        method: 'POST',
        body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
      },
      context,
    )
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>

        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => { //eslint-disable-line
        // console.log(errjson);
      });
  },
};

export const createManyStudents = {
  args: {
    url: { type: new NonNull(StringType) },
  },
  type: new List(StudentType),
  async resolve(obj, args, context) {
    args.hierarchy = JSON.stringify(args.hierarchy);//eslint-disable-line
    const url = `${config.services.settings}/api/student/create/studentList`;
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
      .then(json =>
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => { //eslint-disable-line
        // console.log(errjson);
      });
  },
  description: 'This will take csv file url as input and populate the students',
};

export const deleteStudent = {
  args: {
    studentIds: { type: new NonNull(List(StringType)) },
  },
  type: (GraphQLJSON),
  async resolve(obj, args, context) {
    args.hierarchy = JSON.stringify(args.hierarchy);//eslint-disable-line
    const url = `${config.services.settings}/api/student/delete/student`;
    return fetch(
      url, {
        method: 'POST',
        body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
      },
      context,
    )
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>

        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => { //eslint-disable-line
        // console.log(errjson);
      });
  },
};
const StudentInputType = new InputObjectType({
  name: 'StudentInputType',
  fields: {
    egnifyId: { type: StringType },
    studentId: { type: StringType },
    studentName: { type: StringType },
    fatherName: { type: StringType },
    phone: { type: StringType },
    email: { type: StringType },
    gender: { type: StringType },
    dob: { type: StringType },
    category: { type: StringType },
    hierarchy: { type: GraphQLJSON },
  },
});
export const editStudent = {
  args: {
    studentId: { type: new NonNull(StringType) },
    studentDataUpdate: { type: StudentInputType },
  },
  type: StudentType,
  async resolve(obj, args, context) {
    args.hierarchy = JSON.stringify(args.hierarchy);//eslint-disable-line
    const url = `${config.services.settings}/api/student/edit/student`;
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
      .then(json =>
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => { //eslint-disable-line
        // console.log(errjson);
      });
  },
  description: 'This will take csv file url as input and populate the students',
};


export default{
  createStudent,
  createManyStudents,
  deleteStudent,
  editStudent,
};
