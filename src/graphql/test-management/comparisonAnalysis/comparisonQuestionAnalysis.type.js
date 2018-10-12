import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLEnumType as EnumType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';

export const ComparisonQuestionAnalysisHierarchyInputType = new InputObjectType({
  name: 'ComparisonQuestionAnalysisHierarchyInputType',
  description: 'Input type for hierarchies in comaprison question analysis',
  fields: {
    child: { type: new NonNull(StringType), description: 'Name of the hierarchy node' },
    childCode: { type: new NonNull(StringType), description: 'Internal code of the hierarchy node' },
    level: { type: new NonNull(IntType), description: 'Level number of the hierarchy node' },
  },
});

export const ComparisonQuestionAnalysisInputType = new InputObjectType({
  name: 'ComparisonQuestionAnalysisInputType',
  description: 'Hierarchy wise students question analysis',
  fields: {
    testIds: { type: new List(new NonNull(StringType)), description: 'testIds' },
    hierarchies: { type: new List(ComparisonQuestionAnalysisHierarchyInputType), description: 'Input type for hierarchies in comaprison analysis' },
    viewLevel: { type: new NonNull(IntType), description: 'Level number of the hierarchy nodes to display data' },
  },
});

export default {
  ComparisonQuestionAnalysisInputType,
};
