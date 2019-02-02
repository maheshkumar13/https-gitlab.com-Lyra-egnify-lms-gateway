import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLEnumType as EnumType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

export const HierarchicalAnalysisHierarchyInputType = new InputObjectType({
  name: 'HierarchicalAnalysisHierarchyInputType',
  description: 'hierarchy object',
  fields: {
    childCode: { type: new NonNull(StringType), description: 'Internal code of the hierarchy node' },
    level: { type: new NonNull(IntType), description: 'Level number of the hierarchy node' },
  },
});

export const HierarchicalAnalysisInputType = new InputObjectType({
  name: 'HierarchicalAnalysisInputType',
  description: 'Hierarchy wise students results comparison',
  fields: {
    testId: { type: new NonNull(StringType), description: 'testId' },
    hierarchies: { type: new NonNull(HierarchicalAnalysisHierarchyInputType), description: 'Input type for hierarchies in hierarchical analysis' },
  },
});

export const HierarchicalAnalysisOutputType = new ObjectType({
  name: 'HierarchicalAnalysisOutputType',
  description: '',
  fields: {
    testId: { type: StringType, description: 'testId' },
    childCode: { type: StringType, description: 'ChildCode' },
    child: { type: StringType, description: 'Child' },
    isLeafNode: { type: BooleanType, description: 'is leaf node ' },
    level: { type: IntType },
    parentCode: { type: StringType, description: 'parent node code' },
    totalStudents: { type: IntType },
    topicAnalysis: { type: GraphQLJSON },
    avgAnalysis: { type: GraphQLJSON },
    hierarchyLevels: { type: GraphQLJSON },
    active: { type: BooleanType },
    leafNodes: { type: new List(StringType) },
  },
});

export default {
  HierarchicalAnalysisInputType,
  HierarchicalAnalysisOutputType,
};
