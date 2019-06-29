
/**
@author Sarvagya Bhargava
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLObjectType as ObjectType,
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLBoolean as BooleanType,
  } from 'graphql';
  

export const MarksInputType = new InputType({
  name : 'MarksInputType',
  fields : {
    questionType: { type: StringType, required: true },
    noOfOptions: { type: IntType, default: 4 },
    numberOfQuestions: { type: IntType},
    numberOfSubQuestions: { type: IntType},
    totalMarks: { type: IntType},
    start: { type: IntType},
    end: { type: IntType},
    C: { type: IntType},
    P: { type: IntType},
    W: { type: IntType},
    U: { type: IntType},
    ADD : {type : IntType},
  },
  
});

export const SubjectInput = new InputType({
  name: 'SubjectInput',
  fields: {
    start: { type: IntType},
    end: { type: IntType},
    marks: {type : new List(MarksInputType)},
    subject: { type: StringType},
    totalMarks: { type: IntType},
    totalQuestions: { type: IntType},
  },
});



export const TestPatternInputType = new InputType({
  name: 'TestPatternInputType',
  fields: {
    testName: { type: StringType, description: 'Name of the test pattern' },
    subjects : { type: new List(SubjectInput), description: 'List of subjects and their question distribution' },
    testType: { type: StringType, description: 'Type of test pattern' },
    markingSchemaType: { type: StringType, description: 'Marking Schema Type' },
  }
});

export const MarksType = new ObjectType({
  name : 'MarksType',
  fields : {
    section: { type: IntType, required: true },
    questionType: { type: StringType, required: true },
    noOfOptions: { type: IntType, default: 4 },
    numberOfQuestions: { type: IntType},
    numberOfSubQuestions: { type: IntType},
    totalMarks: { type: IntType},
    start: { type: IntType},
    end: { type: IntType},
    C: { type: IntType},
    P: { type: IntType},
    W: { type: IntType},
    U: { type: IntType},
    ADD : {type : IntType},
  },
  
});

export const Subject = new ObjectType({
  name: 'Subject',
  fields: {
    start: { type: IntType},
    end: { type: IntType},
    marks: {type : new List(MarksType)},
    subject: { type: StringType},
    totalMarks: { type: IntType},
    totalQuestions: { type: IntType},
  },
});

export const TestPatternType = new ObjectType({
  name: 'TestPatternType',
  fields: {
    testName: { type: StringType},
    totalQuestions: { type:IntType},
    subjects : { type: new List(Subject)},
    totalMarks: { type: IntType},
    testType: { type: StringType},
    markingSchemaType: { type: StringType},
    active : {type : BooleanType},
  }
});

export default {
  TestPatternType,
  TestPatternInputType 
};
