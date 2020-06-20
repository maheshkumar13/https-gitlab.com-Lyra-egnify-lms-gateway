/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  // GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';

import { SubjectInputType, UpdateSubjectInputType } from './subject.type';

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

export const updateSubject = {
  args: {
    input: { type: UpdateSubjectInputType, description: 'Update Subject input type' },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.updateSubject(args.input, context);
  },
};

export const deleteSubject = {
  args: {
    subjectCode: { type: new NonNull(StringType), description: 'Code of the subject' }, 
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.deleteSubject(args, context);
  },
};


export default{
  createSubject,
};
