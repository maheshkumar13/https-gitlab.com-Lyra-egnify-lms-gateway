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
import { InstituteHierarchy } from './settings/instituteHierarchy/instituteHierarchy.query';
import { createSubject } from './settings/subject/subject.mutation';

import { Textbooks } from './settings/textbook/textbook.query';
import { createTextbook, updateTextbook, deleteTextbook } from './settings/textbook/textbook.mutation';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      Subjects,
      InstituteHierarchy,
      Textbooks
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createSubject,
      createTextbook,
      updateTextbook,
      deleteTextbook
    },
  }),
});

export default schema;
