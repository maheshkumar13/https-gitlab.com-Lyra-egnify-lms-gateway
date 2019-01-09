/**
@author KSSR
@data    09/01/2019
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLFloat as FloatType,
  GraphQLInputObjectType as InputObjectType,
  GraphQLEnumType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { InputSubjectType, MarkingSchemaType, InputQmapType, TesttypeType, SubjectType, QmapType, SelectedHierarhcyType, ColorSchemaOjbectType, ModeOfConductEnumType } from '../test/test.type';

export const InputRetakeTestType = new InputObjectType({
  name: 'InputRetakeTestType',
  description: 'Input for the test',
  fields: {
    testId: { type: new NonNull(StringType), description: 'Name of the test, testName should not be empty! ' },
  },
});


export const InputUpdateRetakeTestType = new InputObjectType({
  name: 'InputUpdateRetakeTestType',
  description: 'Any number of defined fields get updated',
  fields: {
    testId: { type: new NonNull(StringType), description: 'Unique identifier for test' },
    totalMarks: { type: IntType, description: 'totalMarks in the test' },
    duration: { type: IntType, description: 'Number of minutes of the test duration' },
    subjects: { type: new List(InputSubjectType), description: 'Selected subjects for the test' },
    markingSchema: { type: MarkingSchemaType, description: 'Marks distribution' },
    Qmap: { type: new List(InputQmapType), description: 'Mapping the question with subject, topic and subTopic' },
  },
});


export const RetakeTestType = new ObjectType({
  name: 'RetakeTestType',
  description: 'Test data',
  fields: {
    testId: { type: StringType, description: 'Unique identifier for the test' },
    academicYear: { type: StringType, description: 'Academic Year in which test was helds' },
    testName: { type: StringType, description: 'Name of the test' },
    questionNumberFormat: { type: StringType, description: 'format of a question number' },
    optionNumberFormat: { type: StringType, description: 'format of an option number' },
    testType: { type: TesttypeType, description: 'User defined test pattern' },
    totalMarks: { type: IntType, description: 'Total marks in the test' },
    startTime: { type: StringType, description: 'Time of exam starts' },
    date: { type: StringType, description: 'Date of conducting the test.' },
    duration: { type: IntType, description: 'Test duration in number of minutes' },
    subjects: { type: new List(SubjectType), description: 'Subjects in the test' },
    subjectsordered: { type: BooleanType, description: 'Subjects ordered or not' },
    hierarchyTag: { type: StringType, description: 'Unique identifier for hierarchy' },
    markingSchema: { type: GraphQLJSON, description: 'Marks distribution' },
    Qmap: { type: new List(QmapType), description: 'Question mapping with subject, topic and subTopic' },
    questionPaperUrl: { type: StringType, description: 'Question paper url' },
    questionPaperId: { type: StringType, description: 'Question paper ID' },
    qPageMapping: { type: GraphQLJSON, description: 'Question number page mapping to scroll pdf' },
    selectedHierarchy: { type: SelectedHierarhcyType, description: 'Highest level of hierarchy selected by the user' },
    totalStudents: { type: IntType, description: 'Number of students participating in the test' },
    studentsUploaded: { type: IntType, description: 'Number of student whose results uploaded' },
    percentage: { type: FloatType, description: 'Percentage of result uploaded students' },
    stepsCompleted: { type: IntType, description: 'Number of steps completed in test creation' },
    totalSteps: { type: IntType, description: 'Total steps in test creation' },
    status: { type: StringType, description: 'Current status of the test' },
    colorSchema: { type: new List(ColorSchemaOjbectType), description: 'color schema' },
    gaStatus: { type: StringType, description: 'Current GA Status of the test. Possible State: [not_started,pending,error,finished]' },
    modeOfConduct: { type: new NonNull(ModeOfConductEnumType), description: 'Mode of conduct of the test which can be Online,Offline or Both' },
    testStudentSnapshotStatus: { type: StringType, description: 'Current testStudentSnapshot Sync Status  of the test. Possible State: [not-started,inprogress,scheduled,completed,failed]' },

  },
});
export default {
  InputRetakeTestType,
  InputUpdateRetakeTestType,
  RetakeTestType,
};
