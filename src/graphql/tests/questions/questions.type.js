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
    isGlobalErroneous: { type: BooleanType, description: 'Is parsed successfully' },
    options: { type: GraphQLJSON, description: 'List of options' },
    C: { type: IntType, description: 'Marks for correct response' },
    W: { type: IntType, description: 'Marks for wrong response' },
    U: { type: IntType, description: 'Marks for unattempted' },
    P: { type: IntType, description: 'Marks for partially correct response' },
    ADD: { type: IntType, description: 'ADD Marks' },
    q_type: { type: StringType, description: 'question type' },
    q_category: { type: StringType, description: 'question category' },
    key: { type: new List(StringType), description: 'List of keys' },
    difficulty: { type: StringType, description: 'Difficulty' },
    revised_blooms_taxonomy: { type: StringType, description: 'revised_blooms_taxonomy' }
  },
});

export default {
  QuestionType,
};
