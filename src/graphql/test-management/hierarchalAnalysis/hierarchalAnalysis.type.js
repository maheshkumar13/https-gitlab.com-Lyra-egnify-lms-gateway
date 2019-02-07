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
    child: { type: StringType, description: 'Child name' },
    isLeafNode: { type: BooleanType, description: 'is leaf node ' },
    level: { type: IntType, description: 'level of the hierarchy' },
    parentCode: { type: StringType, description: 'parent node code' },
    totalStudents: { type: IntType, description: 'no of students who has written the exam at a hierarchy level ' },
    topicAnalysis: { type: GraphQLJSON, description: 'topic level analysis' },
    avgAnalysis: { type: GraphQLJSON, description: 'min, max, avg of the students of the test at that hierarchy' },
    hierarchyLevels: { type: GraphQLJSON, description: 'hierarchyLevel code' },
    active: { type: BooleanType, description: 'is active or not' },
    leafNodes: { type: new List(StringType), description: 'leaf nodes of that hierarchyLevel' },
  },
});

export default {
  HierarchicalAnalysisInputType,
  HierarchicalAnalysisOutputType,
};
