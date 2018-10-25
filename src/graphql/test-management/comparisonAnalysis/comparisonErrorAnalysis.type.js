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
  name: 'ComparisonErrorFilterNameEnumType',
  values: {
    errorPercentage: {
      value: 'errorPercentage',
    },
    cwuPercentage: {
      value: 'cwuPercentage',
    },
  },
});

export const ComparisonErrorAnalysisHierarchyInputType = new InputObjectType({
  name: 'ComparisonErrorAnalysisHierarchyInputType',
  description: 'Input type for hierarchies in comaprison error analysis',
  fields: {
    child: { type: new NonNull(StringType), description: 'Name of the hierarchy node' },
    childCode: { type: new NonNull(StringType), description: 'Internal code of the hierarchy node' },
    level: { type: new NonNull(IntType), description: 'Level number of the hierarchy node' },
  },
});

export const ComparisonErrorAnalysisInputType = new InputObjectType({
  name: 'ComparisonErrorAnalysisInputType',
  description: 'Hierarchy wise students error analysis',
  fields: {
    testIds: { type: new List(new NonNull(StringType)), description: 'testIds' },
    hierarchies: { type: new List(ComparisonErrorAnalysisHierarchyInputType), description: 'Input type for hierarchies in comaprison analysis' },
    viewLevel: { type: new NonNull(IntType), description: 'Level number of the hierarchy nodes to display data' },
    filterName: { type: FilterNameEnumType, description: 'Name of the filter' },
  },
});

export default {
  ComparisonErrorAnalysisInputType,
};
