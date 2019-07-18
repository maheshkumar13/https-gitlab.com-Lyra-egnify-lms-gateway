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

import GraphQLJSON from 'graphql-type-json';

import { TextbookType , textbookCode } from './textbook.type';
const controller = require('../../../api/settings/textbook/textbook.controller');

export const Textbooks = {
  args: {
    code: { type: StringType, description: 'Internal code of textbook' },
    classCode: { type: StringType, description: 'childCode code of class' },
    subjectCode: { type: StringType, description: 'Internal code of subject' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientaion name' },
  },
  type: new List(TextbookType),
  async resolve(obj, args, context) {
    return controller.getTextbooks(args, context);
  },
};

export const TextbooksInfo = {
  type: GraphQLJSON,
  async resolve(obj , args , context){ //eslint-disable-line
    return controller.codeAndTextbooks(context);
  },
};


export default{
  Textbooks,
  TextbooksInfo,
};
