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
import { Curriculum } from './settings/curriculum/curriculum.query';
import { SubjectList, SubjectTaxonomy } from './settings/subject/subjectTaxonomy.query';
import { removeSubjectTaxonomy, updateSubjectTaxonomy, createSubjects } from './settings/subject/subjectTaxonomy.mutation';
import { createCurriculum } from './settings/curriculum/curriculum.mutation';
import { Students, downloadStudentSample } from './settings/student/student.query';
import { createStudent, createManyStudents } from './settings/student/student.mutation';
import { createTestPattern, updateTestPattern, removeTestPattern } from './settings/testPattern/testPattern.mutation';
import InstituteHierarchy from './settings/instituteHierarchy/instituteHierarchy.query';
import InstituteHierarchyGrid from './settings/instituteHierarchy/instituteHierarchyGrid.query';
import { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode } from './settings/instituteHierarchy/instituteHierarchy.muatation';
import Institute from './settings/institute/institute.query';
import { createInstitute } from './settings/institute/institute.mutation';
import { createGradeSystem, createGradePattern, removeGradePattern, removeGradeSystem, updateGradeSystem, updateGradePattern } from './settings/grade/grade.mutation';

const schema = new Schema({
  query:

new ObjectType({
    name: 'Query',
    fields: {
      GradeSystem,
      TestPattern,
      Curriculum,
      Students,
      Institute,
      InstituteHierarchy,
      InstituteHierarchyGrid,
      downloadStudentSample,
      SubjectList,
      SubjectTaxonomy,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createStudent,
      createManyStudents,
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
      removeGradeSystem,
      updateGradeSystem,
      createGradePattern,
      removeGradePattern,
      updateGradePattern,
    },
  }),
});

export default schema;
