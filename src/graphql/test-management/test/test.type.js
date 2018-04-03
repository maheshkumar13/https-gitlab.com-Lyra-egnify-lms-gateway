/**
@author Aslam Shaik
@data    14/03/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

const GraphQLDate = require('graphql-date');
// const GraphQLStringType = require('graphql-StringType');
export const TestType = new ObjectType({
  name: 'TestType',
  fields: {
    testId: { type: StringType },
    testName: { type: StringType },
    testType: { type: GraphQLJSON },
    totalMarks: { type: IntType },
    startTime: { type: StringType },
    date: { type: StringType },
    duration: { type: StringType },
    subjects: { type: GraphQLJSON },
    hierarchyTag: { type: StringType },
    creationMetadata: { type: GraphQLJSON },
    questionTypes: { type: GraphQLJSON },
    markingSchema: { type: GraphQLJSON },
    Qmap: { type: GraphQLJSON },
    selectedHierarchy: { type: GraphQLJSON },
    totalStudents: { type: IntType },
    resultsUploaded: { type: IntType },
    resultsUploadedPercentage: { type: IntType },
    stepsCompleted: { type: IntType },
    totalSteps: { type: IntType },
    status: { type: StringType },
    active: { type: BooleanType },
  },
});

export const InputTestType = new InputObjectType({
  name: 'InputTestType',
  fields: {
    testName: { type: StringType, description: 'Define a non-Empty testName' },
    totalMarks: { type: IntType, description: 'totalMarks in the test' },
    date: { type: GraphQLDate, description: 'Define date' },
    startTime: { type: StringType, description: 'startTime should be in range 00:00 to 23:59' },
    duration: { type: StringType, description: 'should be a string, ex: 2.30 (which defines 2h 30mns)' },
    selectedHierarchy: { type: GraphQLJSON, description: 'should be in the following format { parent :"Country", child :"Institute Ty"level:2code:"lvl1 }", ' },
    testType: { type: GraphQLJSON, description: '{"code": "TP0001","name": "fi1","patternCode": "123"}' },
    hierarchy: { type: GraphQLJSON, description: '[{"child": "andhra","childCode": "egnixeos_l11-l21","parent": "India","parentCode": "egnixeos_l11","level": 2,"selected": true,"next": [{"child": "HYD","childCode": "egnixeos_l11-l21-l31","parent": "andhra","parentCode": "egnixeos_l11-l21", "level": 3, "selected": true}]], Please look at the sample queries for better understanding'}, // eslint-disable-line
    subjects: { type: GraphQLJSON, description: '"subjects": [{"code": "CUR0001_SUB0001","subject":"Maths", subjectCode:"MAT101"}]' },
  },
});

export default{
  TestType,
  InputTestType,
};
