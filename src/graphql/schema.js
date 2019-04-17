/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import { Subjects } from './settings/subject/subject.query';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      Subjects,
    },
  }),
  // mutation: new ObjectType({
  //   name: 'Mutation',
  //   fields: {
  //   },
  // }),
});

export default schema;
