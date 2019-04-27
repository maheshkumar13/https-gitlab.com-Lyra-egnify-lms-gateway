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

import { QuestionType } from './questions.type';
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

export default{
  Questions,
};
