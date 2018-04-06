/**
@author Aslam Shaik
@data    14/03/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

const GraphQLDate = require('graphql-date');
// const GraphQLStringType = require('graphql-StringType');
const InputSubjectType = new InputObjectType({
  name: 'InputSubjectType',
  description: 'Subjects selected for the test',
  fields: {
    code: { type: StringType, description: 'Internal code for the subject' },
    parentCode: { type: StringType, description: 'Internal parent code for the subject' },
    subject: { type: StringType, description: 'Name of the subject' },
    subjectCode: { type: StringType, description: 'User defined subject code' },
  },
});

const SubjectType = new ObjectType({
  name: 'SubjectType_',
  description: 'Subjects selected for the test',
  fields: {
    code: { type: StringType, description: 'Internal code for the subject' },
    parentCode: { type: StringType, description: 'Internal parent code for the subject' },
    subject: { type: StringType, description: 'Name of the subject' },
    subjectCode: { type: StringType, description: 'User defined subject code' },
    totalQuestions: { type: IntType, description: 'Total number of question in this subject' },
    qmapCompletion: { type: IntType, description: 'Number of questions completed in question mapping from this subject' },
  },
});


const InputTesttypeType = new InputObjectType({
  name: 'InputTesttypeType',
  description: 'Mode of exam for the test',
  fields: {
    name: { type: StringType, description: 'Name of the testType' },
    patternCode: { type: StringType, description: 'User defined pattern code' },
    code: { type: StringType, description: 'Internal code for testType' },
    description: { type: StringType, description: 'description of the testType' },
  },
});

const TesttypeType = new ObjectType({
  name: 'TesttypeType',
  description: 'Mode of exam for the test',
  fields: {
    name: { type: StringType, description: 'Name of the testType' },
    patternCode: { type: StringType, description: 'User defined pattern code' },
    code: { type: StringType, description: 'Internal code for testType' },
    description: { type: StringType, description: 'description of the testType' },
  },
});

const InputSelectedHierarhcyType = new InputObjectType({
  name: 'InputSelectedHierarhcyType',
  description: 'Highest level of hierarchy selected for the test',
  fields: {
    parent: { type: StringType, description: 'Name of the parent of the node' },
    child: { type: StringType, description: 'Name of the node' },
    level: { type: IntType, description: 'Level of the node' },
    code: { type: StringType, description: 'Internal code for the node' },
  },
});


const SelectedHierarhcyType = new ObjectType({
  name: 'SelectedHierarhcyType',
  description: 'Highest level of hierarchy selected for the test',
  fields: {
    parent: { type: StringType, description: 'Name of the parent of the node' },
    child: { type: StringType, description: 'Name of the node' },
    level: { type: IntType, description: 'Level of the node' },
    code: { type: StringType, description: 'Internal code for the node' },
  },
});

const InputHierarchyType = new InputObjectType({
  name: 'InputHierarchyType',
  description: 'Institute Hierarchy',
  fields: {
    child: { type: StringType, description: 'Name of the node' },
    childCode: { type: StringType, description: 'Internal code of the node' },
    parent: { type: StringType, description: 'Parent name of the node' },
    parentCode: { type: StringType, description: 'Internal code for the parent of the node' },
    level: { type: IntType, description: 'Level of the node' },
    selected: { type: BooleanType, description: 'Selected status of the node' },
    next: { type: GraphQLJSON, description: 'List of child nodes with above described JSON' },
  },
});


export const TestType = new ObjectType({
  name: 'TestType',
  description: 'Test data',
  fields: {
    testId: { type: StringType, description: 'Unique identifier for the test' },
    testName: { type: StringType, description: 'Name of the test' },
    testType: { type: TesttypeType, description: 'User defined test pattern' },
    totalMarks: { type: IntType, description: 'Total marks in the test' },
    startTime: { type: StringType, description: 'Time of exam starts' },
    date: { type: StringType, description: 'Date of conducting the test.' },
    duration: { type: StringType, description: 'Test duration in number of minutes' },
    subjects: { type: new List(SubjectType), description: 'Subjects in the test' },
    hierarchyTag: { type: StringType, description: 'Unique identifier for hierarchy' },
    markingSchema: { type: GraphQLJSON, description: 'Marks distribution' },
    Qmap: { type: GraphQLJSON, description: 'Individual question information' },
    selectedHierarchy: { type: SelectedHierarhcyType, description: 'Highest level of hierarchy selected by the user' },
    totalStudents: { type: IntType, description: 'Number of students participating in the test' },
    resultsUploaded: { type: IntType, description: 'Number of student whose results uploaded' },
    resultsUploadedPercentage: { type: IntType, description: 'Percentage of result uploaded students' },
    stepsCompleted: { type: IntType, description: 'Number of steps completed in test creation' },
    totalSteps: { type: IntType, description: 'Total steps in test creation' },
    status: { type: StringType, description: 'Current status of the test' },
  },
});
export const InputTestType = new InputObjectType({
  name: 'InputTestType',
  description: 'Input for the test',
  fields: {
    testName: { type: new NonNull(StringType), description: 'Name of the test, testName should not be empty! ' },
    totalMarks: { type: new NonNull(IntType), description: 'totalMarks in the test' },
    date: { type: new NonNull(GraphQLDate), description: 'Date of conducting the test.' },
    startTime: { type: new NonNull(StringType), description: 'Time of test starts, should be in range 00:00 to 23:59' },
    duration: { type: new NonNull(IntType), description: 'Number of minutes of the test duration' },
    selectedHierarchy: { type: new NonNull(InputSelectedHierarhcyType), description: '  Highest level of hierarchy selected by the user' },
    testType: { type: new NonNull(InputTesttypeType), description: 'Mode of exam for the test' },
    hierarchy: { type: new NonNull(new List(InputHierarchyType)), description: 'Selected hierarchy for the test'}, // eslint-disable-line
    subjects: { type: new NonNull(new List(InputSubjectType)), description: 'Selected subjects for the test' },
  },
});

export default{
  TestType,
  InputTestType,
};
