/**
@author Rahul Islam
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


export const QuestionType = new ObjectType({
  name: 'QuestionType',
  fields: {
    questionPaperId: { type: StringType, description: 'Unique identifier for question paper' },
    question: { type: StringType, description: 'question text' },
    error: { type: GraphQLJSON, description: 'Error if any' },
    qno: { type: StringType, description: 'Question number' },
    options: { type: GraphQLJSON, description: 'List of options' },
    q_type: { type: StringType, description: 'question type' },
    q_category: { type: StringType, description: 'question category' },
    key: { type: new List(StringType), description: 'List of keys' },
    difficulty: { type: StringType, description: 'Difficulty' },
    revised_blooms_taxonomy: { type: StringType, description: 'revised_blooms_taxonomy' },
    hint: { type: StringType, description: 'Hint' },
    skill: { type: StringType, description: 'Skill' },
    solution: { type: StringType, description: 'Solution' },
    xml_id: { type: IntType, description: 'XML id for question' },
    warnings: { type: GraphQLJSON ,description: "Warnings for questions"},
    concept_name: { type: StringType ,description: "Concept Provided by the vendor"},
    subject: { type: StringType},
    C: { type: IntType},
    table_no: { type: IntType},
    questionTypeMetaData: { type: GraphQLJSON }
  },
});


export const ResultInputType = new InputType({
  name: 'ResultInputType',
  fields: {
    studentId: { type: new NonNull(StringType) },
    questionPaperId: { type: new NonNull(StringType) },
    responses: { type: new NonNull(GraphQLJSON) },
  },
});

export const ResultOutputType = new ObjectType({
  name: 'ResultOutputType',
  fields: {
    countOfC: { type: IntType },
    countOfW: { type: IntType },
    countOfU: { type: IntType },
    obtainedMarks: { type: IntType },
  },
});

export const QuestionEvalInputType = new InputType({
  name: 'QuestionEvalInputType',
  fields: {
    questionPaperId: { type: new NonNull(StringType), description: 'Question Paper Id' },
    questionNos: { type: new List(StringType) },
  },
});

const EvaluatedDataType = new ObjectType({
  name: 'EvaluatedDataType',
  fields: {
    questionNo: { type: StringType, description: 'questionNumber' },
    key: { type: new List(StringType), description: 'Key of the question' },
    hint: { type: StringType, description: 'hint of the question' },
    solution: { type: StringType, description: 'Solution of the question' },
  },
});

export const QuestionEvalOutputType = new ObjectType({
  name: 'QuestionEvalOutputType',
  fields: {
    questionPaperId: { type: StringType, description: 'Question Paper Id' },
    evaluatedData: { type: new List(EvaluatedDataType), description: 'question, key, hint, solution, response' },
  },
});

export default {
  QuestionType,
  ResultInputType,
  ResultOutputType,
  QuestionEvalInputType,
  QuestionEvalOutputType,
};
