/**
@author KSSR
@data    12/05/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputObjectType,
  GraphQLEnumType as EnumType,
  GraphQLList as List,

} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

const DifficultyEnumType = new EnumType({
  name: 'DifficultyEnumType',
  values: {
    Easy: {
      value: 'Easy',
    },
    Medium: {
      value: 'Medium',
    },
    Hard: {
      value: 'Hard',
    },
    Null: {
      value: null,
    },
  },
});

const ResponseEnumType = new EnumType({
  name: 'ResponseEnumType',
  values: {
    C: {
      value: 'C',
    },
    W: {
      value: 'W',
    },
    U: {
      value: 'U',
    },
    ADD: {
      value: 'ADD',
    },
  },
});
// const GraphQLStringType = require('graphql-StringType');
export const QuestionDetailsInputType = new InputObjectType({
  name: 'QuestionDetailsInputType',
  description: 'Input for Question Details query',
  fields: {
    qid: { type: new List(StringType), description: 'Qid of the Question' },
    testId: { type: new List(StringType), description: 'Test Id of the test' },
    questionNumber: { type: new List(StringType), description: 'Question no of the test' },
    subject: { type: new List(StringType), description: 'Name of the subject' },
    subjectCode: { type: new List(StringType), description: 'User defined subject code' },
    topic: { type: new List(StringType), description: 'Name of the topic' },
    topicCode: { type: new List(StringType), description: 'User defined topic code' },
    subTopic: { type: new List(StringType), description: 'Name of the topic' },
    subTopicCode: { type: new List(StringType), description: 'User defined topic code' },
    difficulty: { type: new List(DifficultyEnumType), description: 'User defined Difficulty of question' },
    questionType: { type: new List(StringType), description: 'Type of the Question' },
    questionResponse: { type: new List(ResponseEnumType) },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
});


const pageInfoType = new ObjectType({
  name: 'TestPageInfomation',
  fields() {
    return {
      pageNumber: {
        type: IntType,
      },
      nextPage: {
        type: BooleanType,
      },
      prevPage: {
        type: BooleanType,
      },
      totalPages: {
        type: IntType,
      },
      totalEntries: {
        type: IntType,
      },
    };
  },
});

export const QuestionDetailsType = new ObjectType({
  name: 'QuestionDetailsType',
  description: 'Output selected for the Question Details query',
  fields: {
    page: {
      type: GraphQLJSON,
    },
    pageInfo: { type: pageInfoType, description: 'Pagination Information' },
  },
});


export default{
  QuestionDetailsInputType,
  QuestionDetailsType,
};
