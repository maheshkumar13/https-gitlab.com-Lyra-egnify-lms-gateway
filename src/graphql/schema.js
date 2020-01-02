/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import { Subjects, getSubjectTextbookTopic, TextbooksForEachSubject } from './settings/subject/subject.query';
import { InstituteHierarchy, InstituteHierarchyPaginated, ChildDataFromParent } from './settings/instituteHierarchy/instituteHierarchy.query';
import { Institute } from './settings/institute/institute.query';
import { InstituteHierarchyGrid } from './settings/instituteHierarchy/instituteHierarchyGrid.query';
import { updateCategory } from './settings/instituteHierarchy/instituteHierarchy.mutaion';
import { createSubject } from './settings/subject/subject.mutation';
import { Programs } from './settings/programs/programs.query';
import { Textbooks, TextbooksInfo, TextbookByPagination, ChapterWiseList} from './settings/textbook/textbook.query';
import { createTextbook, updateTextbook, deleteTextbook } from './settings/textbook/textbook.mutation';
import { Students, StudentUniqueValues, StudentsByLastNode, StudentById, studentHeader,StudentListByFilters} from './settings/student/student.query';
import { updateStudentAvatar, updateStudentSubjects } from './settings/student/student.mutation';
import { ConceptTaxonomy } from './settings/conceptTaxonomy/conceptTaxonomy.query';
import { ContentMapping, ContentMappingStats, CmsCategoryStats, CategoryWiseFiles, FileData, CmsTopicLevelStats, TextbookBasedQuiz, DashboardHeadersAssetCount } from './settings/contentMapping/contentMapping.query';
import { LaunchRequest } from './launcher/launchRequest/launchRequest.query';
import { Questions, Results, QuestionEvaluation } from './tests/questions/questions.query';
import { MasterResults } from './tests/masterResults/masterResults.query';
import { InsertContent, UpdateContent, updateMetaData } from './settings/contentMapping/contentMapping.mutation';
import { CreateTestType, DeleteTestType } from './settings/testType/testType.mutation';
import { TestType } from './settings/testType/testType.query';
import { PackageList, PackageDetails } from './settings/package/package.query';
import { CreatePackage, UpdatePackage, FeedbackPackage } from './settings/package/package.mutation';
import { autoComplete, searchResult } from './search/searchRequest/search.query';
import { ListTest, ListSubjectWiseBooksAndTestCount, HeaderCountForTextBookBasedTest } from '../graphql/tests/upload/upload.query';
import { TimeAnalysis, TimeAnalysisStudentsList, TimeAnalysisHeaders, TimeAnalysisStudentsListByDay, StudentLevelTimeAnalysis, TeacherLevelTimeAnalysis } from './analysis/timeAnalysis/timeAnalysis.query';
import { StudentCompletionStats, TeacherLevelCompletionStats, TeacherLevelCompletionHeaders } from './analysis/completion/completion.query';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      Subjects,
      InstituteHierarchy,
      Institute,
      InstituteHierarchyGrid,
      Textbooks,
      TextbookByPagination,
      ChapterWiseList,
      ConceptTaxonomy,
      InstituteHierarchyPaginated,
      Students,
      StudentUniqueValues,
      StudentsByLastNode,
      studentHeader,
      StudentListByFilters,
      Programs,
      ContentMapping,
      LaunchRequest,
      Questions,
      Results,
      StudentById,
      MasterResults,
      CmsCategoryStats,
      CategoryWiseFiles,
      FileData,
      QuestionEvaluation,
      CmsTopicLevelStats,
      TextbookBasedQuiz,
      getSubjectTextbookTopic,
      ContentMappingStats,
      PackageList,
      PackageDetails,
      ChildDataFromParent,
      TestType,
      TextbooksInfo,
      TextbooksForEachSubject,
      DashboardHeadersAssetCount,
      autoComplete,
      searchResult,
      ListTest,
      ListSubjectWiseBooksAndTestCount,
      HeaderCountForTextBookBasedTest,
      TimeAnalysis,
      TimeAnalysisHeaders,
      TimeAnalysisStudentsList,
      TimeAnalysisStudentsListByDay,
      StudentCompletionStats,
      TeacherLevelCompletionStats,
      TeacherLevelCompletionHeaders,
      StudentLevelTimeAnalysis,
      TeacherLevelTimeAnalysis,
      TimeAnalysisHeadersv2,
      TimeAnalysisStudentsListByDayv2,
      TimeAnalysisStudentsListBySubjects,
      TimeAnalysisStudentsListByCategory,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      createSubject,
      createTextbook,
      updateTextbook,
      deleteTextbook,
      updateCategory,
      updateStudentAvatar,
      updateStudentSubjects,
      InsertContent,
      UpdateContent,
      updateMetaData,
      CreateTestType,
      DeleteTestType,
      CreatePackage,
      UpdatePackage,
      FeedbackPackage
    },
  }),
});

export default schema;
