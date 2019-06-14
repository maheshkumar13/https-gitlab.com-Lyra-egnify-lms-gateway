/**
   @author Parsi
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';

import controller from '../../../api/settings/student/student.controller';

export const updateStudentAvatar = {
  args: {
    studentId: { type: new NonNull(StringType) },
    avatarUrl: { type: new NonNull(StringType) },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.updateStudentAvatar(args, context); //eslint-disable-line
  },
};

export const updateStudentSubjects = {
  args: {
    studentId: { type: new NonNull(StringType), description: 'Unique identifier for student' },
    subjectCodes: { type: new NonNull(new List(StringType)), description: 'Subject codes'},
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.updateStudentSubjects(args, context); 
  }
}

export default{
  updateStudentAvatar,
  updateStudentSubjects
};
