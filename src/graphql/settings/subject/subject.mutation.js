/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  // GraphQLList as List,
  // GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';

import { SubjectInputType } from './subject.type';

const controller = require('../../../api/settings/subject/subject.controller');

export const createSubject = {
  args: {
    input: { type: SubjectInputType, description: 'Subject input type' },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.createSubject(args.input, context);
  },
};

export default{
  createSubject,
};
