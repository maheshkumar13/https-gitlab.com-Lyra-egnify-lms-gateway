/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import GradeSystem from './settings/grade/grade.query';
import TestPattern from './settings/testPattern/testPattern.query';
import Curriculum from './settings/curriculum/curriculum.query';
import Institute from './settings/institute/institute.query';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      GradeSystem,
      TestPattern,
      Curriculum,
      Institute,
    },
  }),
  // mutation: new ObjectType({
  //   name: 'Mutation',
  //   fields: {
  //   },
  // }),
});

export default schema;
