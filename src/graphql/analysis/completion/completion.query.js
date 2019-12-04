import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
  // GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { validateAccess } from '../../../utils/validator';

const controller = require('../../../api/analysis/completion/completion.controller');


export const StudentCompletionStats = {
  args: {
    studentId: { type: StringType, description: 'Unique Identifier for the student' },
    classCode: { type: StringType, description: 'Class code' },
    subjectCode: { type: StringType, description: 'Subject code' },
    textbookCode: { type: StringType, description: 'Textbook code' },
    chapterCode: { type: StringType, description: 'Chapter code' },
    categoryWise: { type: BooleanType, description: 'default false, send true if need just category wise stats' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const validRoles = ['STUDENT'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    return controller.getStudentLevelCompletionStats(args, context);
  },
};

export const TeacherLevelCompletionHeaders = {
  args: {
    className: { type: StringType, description: 'Class code' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation name' },
    subjectName: { type: StringType, description: 'Subject code' },
    textbookName: { type: StringType, description: 'Textbook code' },
    chapterName: { type: StringType, description: 'Chapter code' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const validRoles = ['TEACHER-CORNER_VIEW'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    return controller.getAssetCompletionHeaders(args, context);
  },
};

export const TeacherLevelCompletionStats = {
  args: {
    className: { type: StringType, description: 'Class code' },
    branch: { type: StringType, description: 'Branch name' },
    orientation: { type: StringType, description: 'Orientation name' },
    subjectName: { type: StringType, description: 'Subject code' },
    textbookName: { type: StringType, description: 'Textbook code' },
    chapterName: { type: StringType, description: 'Chapter code' },
    studentsData: { type: BooleanType, description: 'default false, send true to get student wise category stats' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const validRoles = ['TEACHER-CORNER_VIEW'];
    if (!validateAccess(validRoles, context)) throw new Error('Access Denied');
    return controller.getTeacherLevelCompletionStats(args, context);
  },
}
export default {
  StudentCompletionStats,
  TeacherLevelCompletionStats,
  TeacherLevelCompletionHeaders
};
