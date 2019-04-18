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

import { SubjectType } from './subject.type';
const controller = require('../../../api/settings/subject/subject.controller');

export const Subjects = {
  args: {
    boardCode: { type: StringType, description: 'Internal code of board' },
    classCode: { type: StringType, description: 'Internal code of class' },
    SubjectType: { type: StringType, description: 'Internal code of subjecttype' }
  },
  type: new List(SubjectType),
  async resolve(obj, args, context) {
    return controller.getSubjects(args, context);
  },
};

export default{
  Subjects,
};
