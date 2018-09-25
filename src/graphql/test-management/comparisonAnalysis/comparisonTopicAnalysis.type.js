import {
  // GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  GraphQLEnumType as EnumType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
// import GraphQLJSON from 'graphql-type-json';

const FilterNameEnumType = new EnumType({ // eslint-disable-line
  name: 'ComparisonTopicFilterNameEnumType',
  values: {
    avgMarks: {
      value: 'avgMarks',
    },
  },
});

export const ComparisonTopicAnalysisHierarchyInputType = new InputObjectType({
  name: 'ComparisonTopicAnalysisHierarchyInputType',
  description: 'Input type for hierarchies in comaprison topic analysis',
  fields: {
    child: { type: new NonNull(StringType), description: 'Name of the hierarchy node' },
    childCode: { type: new NonNull(StringType), description: 'Internal code of the hierarchy node' },
    level: { type: new NonNull(IntType), description: 'Level number of the hierarchy node' },
  },
});

export const ComparisonTopicAnalysisInputType = new InputObjectType({
  name: 'ComparisonTopicAnalysisInputType',
  description: 'Hierarchy wise students results comparison',
  fields: {
    testIds: { type: new List(new NonNull(StringType)), description: 'testIds' },
    hierarchies: { type: new List(ComparisonTopicAnalysisHierarchyInputType), description: 'Input type for hierarchies in comaprison analysis' },
    viewLevel: { type: new NonNull(IntType), description: 'Level number of the hierarchy nodes to display daata' },
  },
});

export default {
  ComparisonTopicAnalysisInputType,
};
