
import {
  // GraphQLList as List,
  // GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  // GraphQLBoolean as BooleanType,
  // GraphQLEnumType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

export const ConceptAnalysisType = new ObjectType({
  name: 'ConceptAnalysisType',
  description: 'Marks distribution subjects and questions wise',
  fields: {
    testId: { type: StringType, description: 'Unique identifier for test' },
    node: { type: StringType, description: 'childCode of the Hierarchy node' },
    parent: { type: StringType, description: 'childCode of parent of Hierarchy node' },
    Analysis: { type: GraphQLJSON, description: 'Question wise Analysis' }  //eslint-disable-line
  },
});

export default{
  ConceptAnalysisType,
};
