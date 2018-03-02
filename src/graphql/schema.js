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
import createCurriculum from './settings/curriculum/curriculum.mutation';
import { SingleStudent, Students } from './settings/student/student.query';
import { createStudent } from './settings/student/student.mutation';
import { createTestPattern, updateTestPattern, removeTestPattern } from './settings/testPattern/testPattern.mutation';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      GradeSystem,
      TestPattern,
      Curriculum,
      SingleStudent,
      Students,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createStudent,
      createTestPattern,
      updateTestPattern,
      removeTestPattern,
      createCurriculum,
    },
  }),
});

export default schema;
