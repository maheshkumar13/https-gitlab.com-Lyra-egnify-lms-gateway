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
  GetUniqueTestDetails,
  Tests,
  TestsForStudentProfile,
  moveTest,
  QuestionTypes,
  DefaultMarkingSchemas,
  TestHierarchyNodes,
  TestHierarchyNodesofMultipleTests,
  FileStatus,
  DownloadSampleQmap,
  DownloadSampleQmapV2,
  TestSubjectDetails,
  TestColourSchemaDetails,
} from './test-management/test/test.query';
import { removeTest, createDummyTest, createDuplicateTest, createTest, updateTest, QmapFileUpload } from './test-management/test/test.mutation';
import { QuestionDetails, QuestionMappingDetails, GetQuestions } from './test-management/question/question.query';
import { QuestionMappings, QuestionMappingsForStudentProfile } from './test-management/questionMapping/questionMapping.query';
import { Curriculum } from './settings/curriculum/curriculum.query';
import { SubjectList, SubjectTaxonomy } from './settings/subject/subjectTaxonomy.query';
import { removeSubjectTaxonomy, updateSubjectTaxonomy, createSubjects } from './settings/subject/subjectTaxonomy.mutation';
import { createCurriculum } from './settings/curriculum/curriculum.mutation';
import { Students, downloadStudentSample, StudentUniqueValues, StudentsByLastNode, StudentsForStudentProfile } from './settings/student/student.query';
import { createStudent, createManyStudents, deleteStudent, editStudent, studentBulkMovement } from './settings/student/student.mutation';
import { createTestPattern, updateTestPattern, removeTestPattern } from './settings/testPattern/testPattern.mutation';
import { InstituteHierarchy, InstituteHierarchySample } from './settings/instituteHierarchy/instituteHierarchy.query';
import { InstituteHierarchyGrid, LevelFilters } from './settings/instituteHierarchy/instituteHierarchyGrid.query';
import { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode, createInstituteHierarchyNodesFromCSV } from './settings/instituteHierarchy/instituteHierarchy.muatation';
import Institute from './settings/institute/institute.query';
import { GetAcademicYear } from './settings/academicYear/academicYear.query';

import { createInstitute, updateInstitute, updateHierarchy } from './settings/institute/institute.mutation';
import { saveTaxonomy } from './settings/conceptTaxonomy/conceptTaxonomy.mutation';
import { GenerateConceptTaxonomy, conceptTaxonomy, ConceptTaxonomyTree } from './settings/conceptTaxonomy/conceptTaxonomy.query';
import { createGradeSystem, createGradePattern, removeGradePattern, removeGradeSystem, updateGradeSystem, updateGradePattern } from './settings/grade/grade.mutation';
import { uploadResult, uploadResultV2, updateUploadedResultV2, updateUploadedResult, comfirmMissingV2, comfirmMissing, deleteResultV2, deleteResult } from './test-management/result-upload/result-upload.mutation';
import { ResultsV2, Results, ResultsSampleDownload, GetOnlineStudents } from './test-management/result-upload/result-upload.query';

import { StudentAverageMarks, StudentAverageMarksForStudentProfile, LeaderBoardPaginated, GenerateAnalysis, GenerateAnalysisv2, CommonAnalysis, MarksDistributionAnalysis, MarksDistributionAnalysisV2, MarksDistributionAnalysisV3, QuestionErrorAnalysis, StudentPerformanceTrendAnalysis, CommonAnalysisPaginated, StudentPerformanceTrendAnalysisPaginated, StudentAverageTrendAnalysisPaginated, MarkAnalysisGraphData, MarkAnalysisGraphDataV2, MarkAnalysisGraphDataAllTests, CommonAnalysisForStudentProfile } from './test-management/ga/ga.query';
import { createTestPatternSchema, updateTestPatternSchema, removeTestPatternSchema } from './test-management/testPattern/testPattern.mutation';
import { TestPatternSchema } from './test-management/testPattern/testPattern.query';
import { ConceptAnalysis } from './test-management/conceptAnalysis/conceptAnalysis.query';
import { QuestionPaperMetrics } from './test-management/questionPaper/questionPaper.query';
import { StudentOverallAverageMarks, StudentOverallCWU } from './test-management/Analysis/studentOverallAnalysis.query';
import { StudentConceptAnalysis, allStudentConceptAnalysis, LevelWiseTestWiseConceptAnalysis, LevelWiseTestWiseConceptAnalysisForStudentProfile, StudentConceptAnalysisForStudentProfile } from './test-management/Analysis/studentConceptAnalysis.query';
import { ComparisonAnalysis } from './test-management/comparisonAnalysis/comparisonAnalysis.query';
import { ComparisonTopicAnalysis } from './test-management/comparisonAnalysis/comparisonTopicAnalysis.query';
import { ComparisonErrorAnalysis } from './test-management/comparisonAnalysis/comparisonErrorAnalysis.query';
import { ComparisonRankAnalysis } from './test-management/comparisonAnalysis/comparisonRankAnalysis.query';
import { AllTestResultAnalysis } from './test-management/allTestAnalysis/allTestAnalysis.query';
// import { ComparisonQuestionAnalysis } from './test-management/comparisonAnalysis/comparisonQuestionAnalysis.query';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      AllTestResultAnalysis,
      GetOnlineStudents,
      ResultsV2,
      Results,
      ResultsSampleDownload,
      GradeSystem,
      TestPattern,
      Curriculum,
      Students,
      StudentsForStudentProfile,
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
      TestsForStudentProfile,
      TestSubjectDetails,
      TestColourSchemaDetails,
      QuestionTypes,
      LevelFilters,
      StudentUniqueValues,
      StudentsByLastNode,
      FileStatus,
      DefaultMarkingSchemas,
      TestHierarchyNodes,
      TestHierarchyNodesofMultipleTests,
      GenerateAnalysis,
      GenerateAnalysisv2,
      CommonAnalysis,
      CommonAnalysisForStudentProfile,
      QuestionErrorAnalysis,
      StudentPerformanceTrendAnalysis,
      StudentPerformanceTrendAnalysisPaginated,
      MarksDistributionAnalysis,
      MarksDistributionAnalysisV2,
      MarksDistributionAnalysisV3,
      MarkAnalysisGraphDataAllTests,
      moveTest,
      DownloadSampleQmap,
      DownloadSampleQmapV2,
      QuestionDetails,
      TestPatternSchema,
      ConceptAnalysis,
      StudentConceptAnalysis,
      StudentConceptAnalysisForStudentProfile,
      allStudentConceptAnalysis,
      CommonAnalysisPaginated,
      MarkAnalysisGraphData,
      QuestionPaperMetrics,
      GetQuestions,
      QuestionMappingDetails,
      MarkAnalysisGraphDataV2,
      GetAcademicYear,
      GetUniqueTestDetails,
      LeaderBoardPaginated,
      QuestionMappings,
      QuestionMappingsForStudentProfile,
      StudentAverageTrendAnalysisPaginated,
      StudentOverallAverageMarks,
      StudentOverallCWU,
      LevelWiseTestWiseConceptAnalysis,
      LevelWiseTestWiseConceptAnalysisForStudentProfile,
      ComparisonAnalysis,
      StudentAverageMarks,
      StudentAverageMarksForStudentProfile,
      ComparisonTopicAnalysis,
      ComparisonErrorAnalysis,
      ComparisonRankAnalysis,
      // ComparisonQuestionAnalysis,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createStudent,
      deleteStudent,
      editStudent,
      createManyStudents,
      studentBulkMovement,
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
      uploadResultV2,
      updateUploadedResultV2,
      updateUploadedResult,
      comfirmMissingV2,
      comfirmMissing,
      deleteResultV2,
      deleteResult,
      QmapFileUpload,
      createTestPatternSchema,
      updateTestPatternSchema,
      removeTestPatternSchema,
    },
  }),
});

export default schema;
