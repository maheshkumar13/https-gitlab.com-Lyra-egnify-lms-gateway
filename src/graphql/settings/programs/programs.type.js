import {
  GraphQLString as StringType,
  GraphQLInputObjectType as InputType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLList as List,
} from 'graphql';

export const ProgramInputType = new InputType({
  name: 'ProgramInputType',
  fields: {
    board: { type: new List(StringType) },
    program: { type: new List(StringType) },
    class: { type: new List(StringType) },
  },
});

export const ProgramOutputType = new ObjectType({
  name: 'ProgramOutputType',
  fields: {
    board: { type: StringType },
    program: { type: StringType },
    class: { type: StringType },
    studentCount: { type: IntType },
  },
});

export default { ProgramInputType, ProgramOutputType };
