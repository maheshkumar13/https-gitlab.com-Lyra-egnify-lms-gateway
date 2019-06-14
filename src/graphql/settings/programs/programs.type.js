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
    program: { type: new List(StringType) },
    class: { type: new List(StringType) },
  },
});

export const ProgramOutputType = new ObjectType({
  name: 'ProgramOutputType',
  fields: {
    program: { type: StringType },
    class: { type: StringType },
    studentCount: { type: IntType },
  },
});

export default { ProgramInputType, ProgramOutputType };
