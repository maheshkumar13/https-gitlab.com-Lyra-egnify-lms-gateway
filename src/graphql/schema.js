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
import { createCurriculum, removeSubjectTaxonomy, updateSubjectTaxonomy, createSubjects } from './settings/curriculum/curriculum.mutation';
import { SingleStudent, Students, downloadStudentSample } from './settings/student/student.query';
import { createStudent } from './settings/student/student.mutation';
import { createTestPattern, updateTestPattern, removeTestPattern } from './settings/testPattern/testPattern.mutation';
import InstituteHierarchy from './settings/instituteHierarchy/instituteHierarchy.query';
import InstituteHierarchyGrid from './settings/instituteHierarchy/instituteHierarchyGrid.query';
import { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode } from './settings/instituteHierarchy/instituteHierarchy.muatation';
import Institute from './settings/institute/institute.query';
import { createInstitute } from './settings/institute/institute.mutation';
import { createGradeSystem, createGradePattern, removeGradeSystem, removeGradePattern } from './settings/grade/grade.mutation';

const schema = new Schema({
  query:

new ObjectType({
    name: 'Query',
    fields: {
      GradeSystem,
      TestPattern,
      Curriculum,
      SingleStudent,
      Students,
      Institute,
      InstituteHierarchy,
      InstituteHierarchyGrid,
      downloadStudentSample,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createStudent,
      createTestPattern,
      updateTestPattern,
      removeTestPattern,
      CreateInstituteHierarchyNode,
      UpdateInstituteHierarchyNode,
      createCurriculum,
      createSubjects,
      updateSubjectTaxonomy,
      removeSubjectTaxonomy,
      createInstitute,
      createGradeSystem,
      createGradePattern,
      removeGradeSystem,
      removeGradePattern,
    },
  }),
});

export default schema;
