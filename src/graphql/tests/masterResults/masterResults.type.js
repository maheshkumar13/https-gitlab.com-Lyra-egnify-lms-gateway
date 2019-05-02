/**
@author parsi
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLInputObjectType as InputType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

export const MasterResultOutputType = new ObjectType({
  name: 'MasterResultOutputType',
  fields: {
    studentId: { type: StringType, description: 'Student Id' },
    results: { type: GraphQLJSON },
    studentName: { type: StringType },
  },
});

export const MasterResultInputType = new InputType({
  name: 'MasterResultInputType',
  fields: {
    studentId: { type: new NonNull(StringType) },
    questionPaperIds: { type: new List(StringType) },
  },
});


export default {
  MasterResultInputType,
  MasterResultOutputType,
};
