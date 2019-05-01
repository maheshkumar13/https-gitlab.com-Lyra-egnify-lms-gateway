/**
@author Aslam Shaik
@data    02/03/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,

  // GraphQLNonNull as NonNull,
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
    gender: { type: StringType },
    dob: { type: StringType },
    category: { type: StringType },
    hierarchy: { type: GraphQLJSON },
    userCreated: { type: BooleanType },
    password: { type: IntType },
    hierarchyLevels: { type: GraphQLJSON },
    orientation: { type: StringType },
  },
});

export const StudentDetailsOutputType = new ObjectType({
  name: 'StudentDetailsOutputType',
  fields: {
    studentId: { type: StringType },
    studentName: { type: StringType },
    hierarchyLevels: { type: GraphQLJSON },
    avatarUrl: { type: StringType },
  },
});

export default {
  StudentType,
  StudentDetailsOutputType,
};
