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

import { TextbookInputType, TextbookType } from './textbook.type';
const controller = require('../../../api/settings/textbook/textbook.controller');

export const createTextbook = {
  args: {
    input: { type: TextbookInputType, description: 'Textbook input type' },
  },
  type: TextbookType,
  async resolve(obj, args, context) {
    return controller.createTextbook(args.input, context);
  },
};

export default{
  createTextbook,
};
