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

} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';

import StudentType from './student.type';

export const createStudent = {
  args: {
    studentName: { type: new NonNull(StringType) },
    studentId: { type: new NonNull(StringType) },
    hierarchy: { type: GraphQLJSON },
  },
  type: StudentType,
  async resolve(obj, args) {
    args.hierarchy = JSON.stringify(args.hierarchy);//eslint-disable-line
    const url = 'http://localhost:5001/api/student/create/student';
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log(json);
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
  async resolve(obj, args) {
    args.hierarchy = JSON.stringify(args.hierarchy);//eslint-disable-line
    const url = 'http://localhost:5001/api/student/create/studentList';
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log(json);
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
};
