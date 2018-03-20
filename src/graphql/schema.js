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
import { Tests, QuestionTypes } from './test-management/test/test.query';
import { removeTest, createDummyTest, createDuplicateTest } from './test-management/test/test.mutation';
import { Curriculum } from './settings/curriculum/curriculum.query';
import { SubjectList, SubjectTaxonomy } from './settings/subject/subjectTaxonomy.query';
import { removeSubjectTaxonomy, updateSubjectTaxonomy, createSubjects } from './settings/subject/subjectTaxonomy.mutation';
import { createCurriculum } from './settings/curriculum/curriculum.mutation';
import { Students, downloadStudentSample, StudentUniqueValues } from './settings/student/student.query';
import { createStudent, createManyStudents } from './settings/student/student.mutation';
import { createTestPattern, updateTestPattern, removeTestPattern } from './settings/testPattern/testPattern.mutation';
import { InstituteHierarchy, InstituteHierarchySample } from './settings/instituteHierarchy/instituteHierarchy.query';
import { InstituteHierarchyGrid, LevelFilters } from './settings/instituteHierarchy/instituteHierarchyGrid.query';
import { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode, createInstituteHierarchyNodesFromCSV } from './settings/instituteHierarchy/instituteHierarchy.muatation';
import Institute from './settings/institute/institute.query';
import { createInstitute, updateInstitute, updateHierarchy } from './settings/institute/institute.mutation';
import { saveTaxonomy } from './settings/conceptTaxonomy/conceptTaxonomy.mutation';
import { GenerateConceptTaxonomy, conceptTaxonomy, ConceptTaxonomyTree } from './settings/conceptTaxonomy/conceptTaxonomy.query';
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
      GenerateConceptTaxonomy,
      InstituteHierarchySample,
      SubjectList,
      SubjectTaxonomy,
      conceptTaxonomy,
      ConceptTaxonomyTree,
      Tests,
      QuestionTypes,
      LevelFilters,
      StudentUniqueValues,
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
      updateInstitute,
      createGradeSystem,
      removeGradeSystem,
      updateGradeSystem,
      createGradePattern,
      removeGradePattern,
      saveTaxonomy,
      updateGradePattern,
      updateHierarchy,
      removeTest,
      createDummyTest,
      createDuplicateTest,
      createInstituteHierarchyNodesFromCSV,
    },
  }),
});

export default schema;
