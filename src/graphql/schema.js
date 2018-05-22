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


import {
  Tests,
  moveTest,
  QuestionTypes,
  DefaultMarkingSchemas,
  TestHierarchyNodes,
  FileStatus,
  DownloadSampleQmap,
} from './test-management/test/test.query';
import { removeTest, createDummyTest, createDuplicateTest, createTest, updateTest, QmapFileUpload } from './test-management/test/test.mutation';
import { QuestionDetails } from './test-management/question/question.query';
import { Curriculum } from './settings/curriculum/curriculum.query';
import { SubjectList, SubjectTaxonomy } from './settings/subject/subjectTaxonomy.query';
import { removeSubjectTaxonomy, updateSubjectTaxonomy, createSubjects } from './settings/subject/subjectTaxonomy.mutation';
import { createCurriculum } from './settings/curriculum/curriculum.mutation';
import { Students, downloadStudentSample, StudentUniqueValues, StudentsByLastNode } from './settings/student/student.query';
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
import { uploadResult, updateUploadedResult, comfirmMissing, deleteResult } from './test-management/result-upload/result-upload.mutation';
import { Results, ResultsSampleDownload } from './test-management/result-upload/result-upload.query';

import { GenerateAnalysis, GenerateAnalysisv2, CommonAnalysis, MarksDistributionAnalysis, QuestionErrorAnalysis, StudentPerformanceTrendAnalysis } from './test-management/ga/ga.query';
import { createTestPatternSchema, updateTestPatternSchema, removeTestPatternSchema } from './test-management/testPattern/testPattern.mutation';
import { TestPatternSchema } from './test-management/testPattern/testPattern.query';
import { ConceptAnalysis } from './test-management/conceptAnalysis/conceptAnalysis.query';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      Results,
      ResultsSampleDownload,
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
      StudentsByLastNode,
      FileStatus,
      DefaultMarkingSchemas,
      TestHierarchyNodes,
      GenerateAnalysis,
      GenerateAnalysisv2,
      CommonAnalysis,
      QuestionErrorAnalysis,
      StudentPerformanceTrendAnalysis,
      MarksDistributionAnalysis,
      moveTest,
      DownloadSampleQmap,
      QuestionDetails,
      TestPatternSchema,
      ConceptAnalysis,
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
      createTest,
      updateTest,
      uploadResult,
      updateUploadedResult,
      comfirmMissing,
      deleteResult,
      QmapFileUpload,
      createTestPatternSchema,
      updateTestPatternSchema,
      removeTestPatternSchema,
    },
  }),
});

export default schema;
