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

import { TextbookType } from './textbook.type';
const controller = require('../../../api/settings/textbook/textbook.controller');

export const Textbooks = {
  args: {
    code: { type: StringType, description: 'Internal code of textbook' },
    boardCode: { type: StringType, description: 'childCode of board' },
    classCode: { type: StringType, description: 'childCode code of class' },
    programCode: { type: StringType, description: 'Internal code of program' },
    subjectCode: { type: StringType, description: 'Internal code of subject' }
  },
  type: new List(TextbookType),
  async resolve(obj, args, context) {
    return controller.getTextbooks(args, context);
  },
};

export default{
  Textbooks,
};
