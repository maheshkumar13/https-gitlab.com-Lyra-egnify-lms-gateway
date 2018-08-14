/**
@author Parsi
@data    09/08/2018
@version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputObjectType,
  GraphQLList as List,

} from 'graphql';

import {
  DifficultyEnumType,
  pageInfoType,
} from '../question/question.type';
// import { pageInfoType } from '../question/question.type';
// import GraphQLJSON from 'graphql-type-json';
// import { TestType } from '../test/test.type';

export const QuestionMappingsInputType = new InputObjectType({
  name: 'QuestionMappingsInputType',
  description: 'Input for Question Details query',
  fields: {
    testId: { type: new NonNull(new List(StringType)), description: 'Test Id of the test' },
    questionNumber: { type: new List(StringType), description: 'Question no of the test' },
    subject: { type: new List(StringType), description: 'Name of the subject' },
    topic: { type: new List(StringType), description: 'Name of the topic' },
    topicCode: { type: new List(StringType), description: 'User defined topic code' },
    subTopic: { type: new List(StringType), description: 'Name of the topic' },
    subTopicCode: { type: new List(StringType), description: 'User defined topic code' },
    questionType: { type: new List(StringType), description: 'Type of the Question' },
    difficulty: { type: new List(DifficultyEnumType), description: 'User defined Difficulty of question' },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
});

export const QuestionMappingsDataType = new ObjectType({
  name: 'QuestionMappingsDataType',
  description: 'Question Mapping details of an exam',
  fields: {
    topic: { type: StringType, description: 'topic of the question' },
    topicCode: { type: StringType, description: 'topic code of the question' },
    subTopic: { type: StringType, description: 'sub topic of the question' },
    subTopicCode: { type: StringType, description: 'sub topic code of the question' },
    active: { type: BooleanType, description: 'Is question active or not' },
    subject: { type: StringType, description: 'subject of the question' },
    testId: { type: StringType, description: 'ID of the Test' },
    questionNumber: { type: StringType, description: 'Question number' },
    qid: { type: StringType, description: 'Question Id' },
    questionType: { type: StringType, description: 'type of the Question' },
    C: { type: IntType, description: 'credits for correct answer' },
    W: { type: IntType, description: 'deductions for Wrong answer' },
    U: { type: IntType, description: 'deductions for Unattempted' },
    ADD: { type: IntType, description: 'Additional credits' },
    difficulty: { type: DifficultyEnumType },
  },
});

export const QuestionMappingsType = new ObjectType({
  name: 'QuestionMappingsType',
  description: 'Output selected for the Question Mappings query',
  fields: {
    page: {
      type: new List(QuestionMappingsDataType),
    },
    pageInfo: { type: pageInfoType, description: 'Pagination Information' },
  },
});

export default{
  QuestionMappingsInputType,
  QuestionMappingsType,
};
