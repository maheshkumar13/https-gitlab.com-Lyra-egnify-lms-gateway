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
import { config } from '../../../config/environment';
import StudentType from './student.type';

const sampleStudentType = new ObjectType({
  name: 'downloadStudentSampleType',
  fields: {
    csvString: { type: StringType },
  },
});


export const Students = {
  args: {
    egnifyId: { type: StringType },
    sortyby: { type: StringType },
    order: { type: IntType },
  },
  type: new List(StudentType),
  async resolve(obj, args) {
    // console.log(args);
    const url = `${config.services.settings}/api/student/students`;
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
