import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLList as List,
  // GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';


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
    return controller.getStudentLevelCompletionStats(args, context);
  },
};

export default {
  StudentCompletionStats,
};
