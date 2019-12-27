import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';
import GraphQLDate from 'graphql-date';

export const TimeAnalysisType = new ObjectType({
  name: 'TimeAnalysisType',
  fields: {
    studentId: { type: StringType, description: 'Student Id' },
    studentName: { type: StringType, description: 'Student Name' },
    date: { type: GraphQLDate, description: 'date in UTC' },
    totalStudents: { type: IntType, description: 'Number of students' },
    totalTimeSpent: { type: IntType, description: 'Total time spent' },
    isStudent: { type: BooleanType, description: 'if needs students data send it as true' },
    subject: { type: GraphQLJSON, description: 'subject level analysis' },
    category: { type: GraphQLJSON, description: 'category wise analysis' },
    refs: { type: GraphQLJSON, description: 'references' },
  },
});

export const TimeAnalysisHeadersType = new ObjectType({
  name: 'TimeAnalysisHeadersType',
  fields: {
    class: { type: new List(StringType), description: 'List of available classes by search condition' },
    branch: { type: new List(StringType), description: 'List of available branches by search condition' },
    orientation: { type: new List(StringType), description: 'List of available orientations by search condition' },
    section: { type: new List(StringType), description: 'List of available sections' },
    subject: { type: new List(StringType), description: 'List of available subjects by search condition' },
  },
});

export const TimeAnalysisHeadersTypev2 = new ObjectType({
  name: 'TimeAnalysisHeadersTypev2',
  fields: {
    class: { type: new List(StringType), description: 'List of available classes by search condition' },
    branch: { type: new List(StringType), description: 'List of available branches by search condition' },
    orientation: { type: new List(StringType), description: 'List of available orientations by search condition' },
    section: { type: new List(StringType), description: 'List of available sections' },
  },
});

export const TimeAnalysisListType = new ObjectType({
  name: 'TimeAnalysisListType',
  fields: {
    studentId: { type: StringType, description: 'Student Id' },
    studentName: { type: StringType, description: 'Student Name' },
    data: { type: new List(GraphQLJSON) }

  },
});

export const TimeAnalysisListByDayType = new ObjectType({
  name: 'TimeAnalysisListByDayType',
  fields: {
    studentId: { type: StringType, description: 'Student Id' },
    studentName: { type: StringType, description: 'Student Name' },
    totalTimeSpent: { type: IntType, description: 'Total Time Spent' },
    data: { type: new List(GraphQLJSON) }

  },
});

export const TimeAnalysisListByDayTypev2 = new ObjectType({
  name: 'TimeAnalysisListByDayTypev2',
  fields: {
    studentId: { type: StringType, description: 'Student Id' },
    studentName: { type: StringType, description: 'Student Name' },
    class: { type: StringType, description: 'Class Name' },
    branch: { type: StringType, description: 'Branch Name' },
    orientation: { type: StringType, description: 'Orientation Name' },
    section: { type: StringType, description: 'Section Name' },
    totalTimeSpent: { type: GraphQLJSON, description: 'Total time spent' },
    data: { type: new List(GraphQLJSON) }
  },
});
export default {
  TimeAnalysisType,
  TimeAnalysisHeadersType,
  TimeAnalysisListType,
  TimeAnalysisListByDayType
};

