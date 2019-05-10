/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';

import {
  QuestionType,
  ResultInputType,
  ResultOutputType,
  QuestionEvalInputType,
  QuestionEvalOutputType,
} from './questions.type';

const controller = require('../../../api/tests/questions/questions.controller');

export const Questions = {
  args: {
    questionPaperId: { type: new NonNull(StringType), description: 'Question paper id' },
  },
  type: new List(QuestionType),
  async resolve(obj, args, context) {
    return controller.getQuestions(args, context);
  },
};

export const Results = {
  args: {
    input: { type: ResultInputType, description: 'Question Paper Id and student responses' },
  },
  type: ResultOutputType,
  async resolve(obj, args, context) {
    return controller.getAndSaveResults(args, context);
  },
};

export const QuestionEvaluation = {
  args: {
    input: { type: QuestionEvalInputType, description: 'Question level evaluation' },
  },
  type: QuestionEvalOutputType,
  async resolve(obj, args, context) {
    return controller.getQuestionLevelEvaluatedData(args, context);
  },
};

export default{
  Questions,
  Results,
  QuestionEvaluation,
};
