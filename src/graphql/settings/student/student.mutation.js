/**
   @author Aslam Shaik
   @date    02/03/2018
   @version 1.0.0
*/

import {
  // GraphQLList as List,
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
      .then(response => response.json())
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
export default{
  createStudent,
};
