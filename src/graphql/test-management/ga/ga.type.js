/**
@author Rahul Islam
@data    XX/XX/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLFloat as FloatType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { TestType } from '../test/test.type';


const FilterInputType = new InputObjectType({
  name: 'Filter',
  description: 'Filter For Graph QL Calls ',
  fields: {
    filterName: { type: StringType },
    values: { type: new List(GraphQLJSON) },
  },
});

export const FilterListInputType = new InputObjectType({
  name: 'FilterList',
  description: 'List of Filters For Graph QL Calls',
  fields: {
    filters: {
      type: new List(FilterInputType),
    },
  },
});


const MarkAnalysisDataType = new ObjectType({
  name: 'MarkAnalysisDataType',
  description: 'Mark Analysis Values',
  fields: {
    obtainedMarks: { type: FloatType, description: 'Total Obtained Marks' },
    totalMarks: { type: FloatType, description: 'Totals Marks That Can Be Obtained' },
    percentage: { type: FloatType, description: 'Percentage' },
  },
});


const MarkAnalysisType = new ObjectType({
  name: 'MarkAnalysisType',
  description: 'Mark Analysis',
  fields: {
    subject: { type: StringType, description: 'subject code or name' },
    data: { type: MarkAnalysisDataType, description: 'Mark analysis data type' },
  },
});

const RankAnalysisDataType = new ObjectType({
  name: 'RankAnalysisDataType',
  description: 'Rank Analysis Values',
  fields: {
    rank: { type: FloatType, description: 'Rank Obtained' },
  },
});

const RankAnalysisType = new ObjectType({
  name: 'RankAnalysisType',
  description: 'Rank Analysis',
  fields: {
    subject: { type: StringType, description: 'subject code or name' },
    data: { type: RankAnalysisDataType, description: 'Rank analysis data type' },
  },
});
const CWUAnalysisDataType = new ObjectType({
  name: 'CWUAnalysisDataType',
  description: 'CWU Analysis Values',
  fields: {
    C: { type: FloatType, description: 'Number of Correct' },
    W: { type: FloatType, description: 'Numbers of Wrong' },
    U: { type: FloatType, description: 'Number of Unattempted' },
    UW: { type: FloatType, description: 'Number of Unattempted + Wrong' },
  },
});

const CWUAnalysisType = new ObjectType({
  name: 'CWUAnalysisType',
  description: 'CWU Analysis',
  fields: {
    subject: { type: StringType, description: 'subject code or name' },
    data: { type: CWUAnalysisDataType, description: 'CWU analysis data type' },
  },
});

const ErrorDataType = new ObjectType({
  name: 'ErrorDataType',
  description: 'Error Data',
  fields: {
    questionNumber: { type: StringType, description: 'subject code or name' },
    subject: { type: StringType, description: 'subject code or name' },
    C: { type: FloatType, description: 'Number of Correct' },
    W: { type: FloatType, description: 'Numbers of Wrong' },
    U: { type: FloatType, description: 'Number of Unattempted' },
    UW: { type: FloatType, description: 'Number of Unattempted + Wrong' },
    percentage: { type: FloatType, description: 'Percentage of Unattempted + Wrong' },
  },
});

export const CommonAnalysisDataType = new ObjectType({
  name: 'CommonAnalysisDataType',
  description: 'Coomon Reports per Student',
  fields: {
    // student data
    studentId: { type: StringType, description: 'ID of the Student' },
    studentMetaData: { type: GraphQLJSON, description: 'Student Meta Data' },
    name: { type: StringType, description: 'Name of the Student' },

    // test data
    testId: { type: StringType, description: 'ID of the Test' },
    testMetaData: { type: TestType, description: 'Test Meta Data' },
    QMap: { type: GraphQLJSON, description: 'Individual question information like subtopic, topic, subject, CWU' },
    QMapArray: { type: GraphQLJSON, description: 'Individual question information like subtopic, topic, subject, CWU' },

    // // Analysis
    responseData: { type: GraphQLJSON, description: 'Key-Value pairs of questionResponse and questionMarks' },
    cwuAnalysis: { type: new List(CWUAnalysisType), description: 'CWU Analysis of an Invidual Student' },
    markAnalysis: { type: new List(MarkAnalysisType), description: 'Mark Analysis of an Invidual Student' },
    rankAnalysis: { type: new List(RankAnalysisType), description: 'Rank Analysis of an Invidual Student' },
  },
});

export const CommonAnalysisType = new ObjectType({
  name: 'CommonAnalysisType',
  description: 'Coomon Reports per Student',
  fields: {
    // test data
    testId: { type: StringType, description: 'ID of the Test' },

    // // Analysis
    data: { type: new List(CommonAnalysisDataType), description: 'Rank Analysis of an Invidual Student' },
  },
});

export const QuestionErrorAnalysisType = new ObjectType({
  name: 'QuestionErrorAnalysisType',
  description: 'Question Error Analysis Per Test',
  fields: {
    // student data

    // test data
    testId: { type: StringType, description: 'ID of the Test' },
    QMap: { type: GraphQLJSON, description: 'Individual question information like subtopic, topic, subject, CWU' },
    TotalStudent: { type: IntType, description: 'Total number of student attempted the test' },
    // // Analysis
    errorData: { type: new List(ErrorDataType), description: 'Question wise error analysis' },
  },
});

export const GenerateAnalysisReturnType = new ObjectType({
  name: 'GenerateAnalysisReturnType',
  description: 'Generate Analysis',
  fields: {
    // test data
    testId: { type: StringType, description: 'ID of the Test' },
    gaStatus: { type: StringType, description: 'GA Status' },
  },
});

export default {
  CommonAnalysisType,
  FilterListInputType,
  QuestionErrorAnalysisType,
  GenerateAnalysisReturnType,
};
