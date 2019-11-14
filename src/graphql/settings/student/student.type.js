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
  GraphQLList as List,

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
    subjects: { type: GraphQLJSON },
    hierarchy: { type: GraphQLJSON },
    orientation: { type: StringType },
    prepSkill: { type: BooleanType },
  },
});

export const StudentHeaderType = new ObjectType({
  name: 'StudentHeaderType',
  fields: {
    headers: { type: GraphQLJSON },
    summary: { type: GraphQLJSON },

  },
});
// type for student list filter with pagination type
    //student data return type
export const StudentListByFiltersType = new ObjectType({
  name: 'StudentListByFiltersType',
  fields: {
    studentId: { type: StringType,description: 'Unique Student Id' },
    studentName: { type: StringType,description: 'Name of student' },
    fatherName: { type: StringType,description: 'Name of father' },
    dob: { type: StringType,description: 'dob of student' },
    gender: { type: StringType,description: 'M -> male , F -> Female' },
    active: { type: BooleanType,description: 'true/false' },
    user: { type: BooleanType,description: 'user active status true/false' },
    avatarUrl: { type: StringType,description: 'profile pic' },
    hierarchy: { type: GraphQLJSON, description: 'data of student hierarchy' },
    hierarchyLevels: { type: GraphQLJSON, description: 'data of student hierarchy' },
    orientation: { type: StringType,description: 'orientation of student' },
    phone: { type: StringType ,description: 'contact no student'},
    prepSkill: { type: BooleanType,description: 'true/false' },
  },
});
    //student pagination type
export const StudentPageInfoType = new ObjectType({
  name: 'StudentPageInfoType',
  fields: {
      pageNumber: {
        type: IntType,
        description:"current page number"
      },
      limit: {
        type: IntType,
        description: "per page limit"
      },
      nextPage: {
        type: BooleanType,
        description:"true/false"
      },
      prevPage: {
        type: BooleanType,
        description: "true/false"
      },
      totalPages: {
        type: IntType,
        description: "counting of total page which is totalpage/limit"
      },
      totalEntries: {
        type: IntType,
        description: "counting of total page"
      },   
  },
});
    //Student List By F"prevPage": false,ilters Output Type
export const StudentListByFiltersOutputType = new ObjectType({
  name: 'StudentListByFiltersOutputType',
  fields: {
      page: {
        type: new List(StudentListByFiltersType),
      description: "student data"
      },
      pageInfo: {
        type: StudentPageInfoType,
        description: "data of pagination"
      },
    }
  
}); 
export default {
  StudentType,
  StudentDetailsOutputType,
  StudentHeaderType,
  StudentListByFiltersOutputType
};
