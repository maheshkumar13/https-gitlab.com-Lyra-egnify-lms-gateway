/**
@author Aslam Shaik
@data    02/03/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

// const GraphQLDate = require('graphql-date');

export const StudentType = new ObjectType({
  name: 'StudentType',
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

export const StudentInputType = new InputObjectType({
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

export default{
  StudentInputType,
  StudentType,
};
