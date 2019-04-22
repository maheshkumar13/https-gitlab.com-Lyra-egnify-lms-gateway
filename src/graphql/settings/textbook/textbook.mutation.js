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

import { TextbookInputType, TextbookType, updateTextbookInputType } from './textbook.type';
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

export const updateTextbook = {
  args: {
    input: { type: updateTextbookInputType, description: 'Textbook input type for update' },
  },
  type: TextbookType,
  async resolve(obj, args, context) {
    return controller.updateTextbook(args.input, context);
  },
};

export const deleteTextbook = {
  args: {
    code: { type: StringType, description: 'Internal code for text book' },
  },
  type: TextbookType,
  async resolve(obj, args, context) {
    return controller.deleteTextbook(args, context);
  },
};


export default{
  createTextbook,
  updateTextbook,
  deleteTextbook
};
