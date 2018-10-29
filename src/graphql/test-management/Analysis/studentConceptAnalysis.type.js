import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  // GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';

export const LevelWiseTestWiseConceptAnalysisInputType = new InputObjectType({
  name: 'LevelWiseTestWiseConceptAnalysisInputType',
  description: 'level (topic / sub-topic) wise test wise concept analysis ',
  fields: {
    studentId: { type: new NonNull(StringType), description: 'id of the student' },
    level: { type: new NonNull(StringType), description: 'level for which break down is required (subject / topic)' },
    filter: { type: new List(StringType), description: 'list of nodes to filter in the level next to the level mentioned' },
  },
});
export const LevelWiseTestWiseConceptAnalysisForStudentProfileInputType = new InputObjectType({
  name: 'LevelWiseTestWiseConceptAnalysisForStudentProfileInputType',
  description: 'level (topic / sub-topic) wise test wise concept analysis ',
  fields: {
    level: { type: new NonNull(StringType), description: 'level for which break down is required (subject / topic)' },
    filter: { type: new List(StringType), description: 'list of nodes to filter in the level next to the level mentioned' },
  },
});

export default {
  LevelWiseTestWiseConceptAnalysisInputType,
  LevelWiseTestWiseConceptAnalysisForStudentProfileInputType,
};
