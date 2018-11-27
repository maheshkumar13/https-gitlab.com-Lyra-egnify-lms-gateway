import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLEnumType as EnumType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';

export const ComparisonTopicErrorAnalysisHierarchyInputType = new InputObjectType({
  name: 'ComparisonTopicErrorAnalysisHierarchyInputType',
  description: 'Input type for hierarchies in comaprison topic analysis',
  fields: {
    child: { type: new NonNull(StringType), description: 'Name of the hierarchy node' },
    childCode: { type: new NonNull(StringType), description: 'Internal code of the hierarchy node' },
    level: { type: new NonNull(IntType), description: 'Level number of the hierarchy node' },
  },
});

export const ComparisonTopicErrorAnalysisInputType = new InputObjectType({
  name: 'ComparisonTopicErrorAnalysisInputType',
  description: 'Hierarchy wise students error results comparison',
  fields: {
    testId: { type: new NonNull(StringType), description: 'testId' },
    hierarchies: { type: new List(ComparisonTopicErrorAnalysisHierarchyInputType), description: 'Input type for hierarchies in comaprison analysis' },
    viewLevel: { type: new NonNull(IntType), description: 'Level number of the hierarchy nodes to display data' },
  },
});

export default {
  ComparisonTopicErrorAnalysisInputType,
};
