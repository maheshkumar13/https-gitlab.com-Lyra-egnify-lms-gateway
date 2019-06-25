
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
  
  import GraphQLJSON from 'graphql-type-json';

import mongoose from 'mongoose';
import { getDB } from '../../../db';

export const MarksInputType = new InputType({
  name : 'MarksInputType',
  fields : {
    // section: { type: IntType, required: true },
    questionType: { type: StringType, required: true },
    // egnifyQuestionType: { type: String, enum: ['Single answer type', 'Multiple answer type', 'Integer type', 'Paragraph type', 'Matrix list type', 'Matrix match type'] },
    noOfOptions: { type: IntType, default: 4 },
    numberOfQuestions: { type: IntType},
    numberOfSubQuestions: { type: IntType},
    // marksPerQuestion: { type: IntType},
    totalMarks: { type: IntType},
    start: { type: IntType},
    end: { type: IntType},
    C: { type: IntType},
    P: { type: IntType},
    W: { type: IntType},
    U: { type: IntType},
      // ADD: { type: Number, default: 0 },
      // P: { type: Number, default: 0 },
    // paragraph_start: { type: [Number] }
  },
  
});

export const SubjectInput = new InputType({
  name: 'SubjectInput',
  fields: {
    // code : {type : StringType},
    start: { type: IntType},
    end: { type: IntType},
    marks: {type : new List(MarksInputType)},
    subject: { type: StringType},
    // subjectCode: { type: StringType},
    totalMarks: { type: IntType},
    totalQuestions: { type: IntType},
  },
});



export const TestPatternInputType = new InputType({
  name: 'TestPatternInputType',
  fields: {
    testName: { type: StringType, description: 'Name of the textbook' },
    // totalQuestions: { type: IntType, description: 'Name of the textbook' },
    subjects : { type: new List(SubjectInput), description: 'childCode of class' },
    // totalMarks: { type: IntType, description: 'Name of the textbook' },
    testType: { type: StringType, description: 'Name of the textbook' },
    markingSchemaType: { type: StringType, description: 'Name of the textbook' },
  }
});

// export const UpdateTestPatternInputType = new InputType({
//   name: 'UpdateTestPatternInputType',
//   fields: {
//     testName : {type: StringType},
//     subjectName : {type: StringType},
//     questionType : {type: StringType},
//     noOfOptions: {type: IntType},
//     numberOfSubQuestions: {type: IntType},
//     numberOfQuestions: {type: IntType},
//     C: {type: IntType},
//     W: {type: IntType},
//     P: {type: IntType},
//     U: {type: IntType},
//   }
// })

export const MarksType = new ObjectType({
  name : 'MarksType',
  fields : {
    section: { type: IntType, required: true },
    questionType: { type: StringType, required: true },
    // egnifyQuestionType: { type: String, enum: ['Single answer type', 'Multiple answer type', 'Integer type', 'Paragraph type', 'Matrix list type', 'Matrix match type'] },
    noOfOptions: { type: IntType, default: 4 },
    numberOfQuestions: { type: IntType},
    numberOfSubQuestions: { type: IntType},
    // marksPerQuestion: { type: IntType},
    totalMarks: { type: IntType},
    start: { type: IntType},
    end: { type: IntType},
    C: { type: IntType},
    P: { type: IntType},
    W: { type: IntType},
    U: { type: IntType},
      // ADD: { type: Number, default: 0 },
      // P: { type: Number, default: 0 },
    // paragraph_start: { type: [Number] }
  },
  
});

export const Subject = new ObjectType({
  name: 'Subject',
  fields: {
    // code : {type : StringType},
    start: { type: IntType},
    end: { type: IntType},
    marks: {type : new List(MarksType)},
    subject: { type: StringType},
    // subjectCode: { type: StringType},
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
  // UpdateTestPatternInputType    
};
