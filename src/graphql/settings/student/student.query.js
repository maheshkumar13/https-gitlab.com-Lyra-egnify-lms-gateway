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
} from 'graphql';
import fetch from 'universal-fetch';

import StudentType from './student.type';

const sampleStudentType = new ObjectType({
  name: 'downloadStudentSampleType',
  fields: {
    csvString: { type: StringType },
  },
});

export const SingleStudent = {
  args: {
    egnifyId: { type: new NonNull(StringType) },
  },
  type: new List(StudentType),
  async resolve(obj, args) {
    // console.log(args);
    const url = 'http://localhost:5001/api/student/getSingleStudent';
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' }, //eslint-disable-line
    })
      .then(response => response.json())
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const Students = {
  args: {
    egnifyId: {type: StringType },
    sortyby: { type: StringType },
    order: { type: IntType },
  },
  type: new List(StudentType),
  async resolve(obj, args) {
    // console.log(args);
    const url = 'http://localhost:5001/api/student/students';
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .then(json =>{
        return json})
      .catch((err) => {
        console.error(err);
      });
  },
};
export const downloadStudentSample = {

  type: sampleStudentType,
  async resolve(obj, args) {
    // console.log(args);
    const url = 'http://localhost:5001/api/student/downloadStudentSample';
    return fetch(url, {
      method: 'POST',
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .then(json => {
        return json})
      .catch((err) => {
        console.error(err);
      });
  },
};

export default{
  downloadStudentSample,
  SingleStudent,
  Students,
};
