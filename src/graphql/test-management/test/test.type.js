/**
@author Aslam Shaik
@data    14/03/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLFloat as FloatType,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

// const GraphQLStringType = require('graphql-StringType');
const InputSubjectType = new InputObjectType({
  name: 'InputSubjectType',
  description: 'Subjects selected for the test',
  fields: {
    code: { type: StringType, description: 'Internal code for the subject' },
    parentCode: { type: StringType, description: 'Internal parent code for the subject' },
    subject: { type: StringType, description: 'Name of the subject' },
    subjectCode: { type: StringType, description: 'User defined subject code' },
  },
});

const testDataType = new ObjectType({
  name: 'testDataType',
  description: 'testDataType',
  fields: {
    testId: { type: StringType, description: 'testId' },
    testName: { type: StringType, description: 'testName' },
    date: { type: StringType, description: 'date ' },
  },
});
export const academicYearDataType = new ObjectType({
  name: 'academicYearDataType',
  description: 'academicYearDataType',
  fields: {
    academicYear: { type: StringType, description: 'Academic Year ' },
    testType: { type: new List(StringType), description: 'List of Test Type' },
    testData: { type: new List(testDataType), description: 'List of Test data' },
  },
});

export const UniqueTestDetailsType = new ObjectType({
  name: 'UniqueTestDetailsType',
  description: 'UniqueTestDetailsType',
  fields: {
    academicYearList: { type: new List(StringType), description: 'List of Unique Academic Year for all test that has been created' },
    academicYearData: { type: new List(academicYearDataType), description: ' Academic Year Test data' },
  },
});
const SubjectType = new ObjectType({
  name: 'SubjectType_',
  description: 'Subjects selected for the test',
  fields: {
    code: { type: StringType, description: 'Internal code for the subject' },
    parentCode: { type: StringType, description: 'Internal parent code for the subject' },
    subject: { type: StringType, description: 'Name of the subject' },
    subjectCode: { type: StringType, description: 'User defined subject code' },
    totalQuestions: { type: IntType, description: 'Total number of question in this subject' },
    qmapCompletion: { type: IntType, description: 'Number of questions completed in question mapping from this subject' },
  },
});


const InputTesttypeType = new InputObjectType({
  name: 'InputTesttypeType',
  description: 'Mode of exam for the test',
  fields: {
    name: { type: StringType, description: 'Name of the testType' },
    patternCode: { type: StringType, description: 'User defined pattern code' },
    code: { type: StringType, description: 'Internal code for testType' },
    description: { type: StringType, description: 'description of the testType' },
  },
});

const TesttypeType = new ObjectType({
  name: 'TesttypeType',
  description: 'Mode of exam for the test',
  fields: {
    name: { type: StringType, description: 'Name of the testType' },
    patternCode: { type: StringType, description: 'User defined pattern code' },
    code: { type: StringType, description: 'Internal code for testType' },
    description: { type: StringType, description: 'description of the testType' },
  },
});

const InputSelectedHierarhcyType = new InputObjectType({
  name: 'InputSelectedHierarhcyType',
  description: 'Highest level of hierarchy selected for the test',
  fields: {
    parent: { type: StringType, description: 'Name of the parent of the node' },
    child: { type: StringType, description: 'Name of the node' },
    level: { type: IntType, description: 'Level of the node' },
    code: { type: StringType, description: 'Internal code for the node' },
  },
});


const SelectedHierarhcyType = new ObjectType({
  name: 'SelectedHierarhcyType',
  description: 'Highest level of hierarchy selected for the test',
  fields: {
    parent: { type: StringType, description: 'Name of the parent of the node' },
    child: { type: StringType, description: 'Name of the node' },
    level: { type: IntType, description: 'Level of the node' },
    code: { type: StringType, description: 'Internal code for the node' },
  },
});

const InputHierarchyType = new InputObjectType({
  name: 'InputHierarchyType',
  description: 'Institute Hierarchy',
  fields: {
    child: { type: StringType, description: 'Name of the node' },
    childCode: { type: StringType, description: 'Internal code of the node' },
    parent: { type: StringType, description: 'Parent name of the node' },
    parentCode: { type: StringType, description: 'Internal code for the parent of the node' },
    level: { type: IntType, description: 'Level of the node' },
    selected: { type: BooleanType, description: 'Selected status of the node' },
    next: { type: GraphQLJSON, description: 'List of child nodes with above described JSON' },
    isLeafNode: { type: BooleanType, description: 'Specifies if a node is leaf node or not' },
  },
});

const SubjectMarksInMarkingSchemaType = new InputObjectType({
  name: 'SubjectMarksInMarkingSchemaType',
  description: 'Section wise marks in subject',
  fields: {
    questionType: { type: StringType, description: 'Type of question' },
    numberOfQuestions: { type: IntType, description: 'Number o question in this question' },
    numberOfSubQuestions: { type: IntType, description: 'Number of sub questions in this question' },
    section: { type: IntType, description: 'Section number' },
    C: { type: StringType, description: 'Marks for each correct answered question in this question' },
    W: { type: StringType, description: 'Marks for each wrong answered question in this question' },
    U: { type: StringType, description: 'Marks for each Unattempted question' },
    P: { type: StringType, description: 'Partial Marks' },
    ADD: { type: StringType, description: 'Additional marks if any' },
    start: { type: IntType, description: 'First question number in this section' },
    end: { type: IntType, description: 'Last question number in this section' },
    totalMarks: { type: IntType, description: 'Total marks in this section' },
  },
});


const SubjectMarkingSchemaType = new InputObjectType({
  name: 'SubjectMarkingSchemaType',
  description: 'Subject wise marks distribution',
  fields: {
    tieBreaker: { type: IntType, description: 'Priority in case of tie' },
    start: { type: IntType, description: 'First question number in this subject' },
    end: { type: IntType, description: 'Last question number in this subject' },
    subject: { type: StringType, description: 'Name of the subject' },
    totalQuestions: { type: IntType, description: 'Total questions in this subject' },
    totalMarks: { type: IntType, description: 'Total marks in this subject' },
    marks: { type: new List(SubjectMarksInMarkingSchemaType), description: 'Section wise marks distribution for this subject' },
  },
});

export const MarkingSchemaType = new InputObjectType({
  name: 'MarkingSchemaType',
  description: 'Marks distribution subjects and questions wise',
  fields: {
    testType: { type: StringType, description: 'Type of marking schema based on test pattern selected' },
    testName: { type: StringType, description: 'Name of marking schema based on test pattern selected' },
    totalQuestions: { type: IntType, description: 'Total number of questions in the test' },
    totalMarks: { type: IntType, description: 'Total marks in the test' },
    subjects: { type: new List(SubjectMarkingSchemaType), description: 'Marks distribution' },
  },
});
// export const GAStatusMeta = new InputObjectType({
//   name: 'MarkingSchemaType',
//   description: 'Marks distribution subjects and questions wise',
//   fields: {
//     totalQuestions: { type: IntType, description: 'Total number of questions in the test' },
//     totalMarks: { type: IntType, description: 'Total marks in the test' },
//     subjects: { type: new List(SubjectMarkingSchemaType), description: 'Marks distribution' },
//   },
// });

export const InputQmapSubjectType = new InputObjectType({
  name: 'InputQmapSubjectType',
  description: 'Subject details in each Qmap object',
  fields: {
    name: { type: new NonNull(StringType), description: 'Name of the Subject' },
    code: { type: new NonNull(StringType), description: 'System generated subject code' },
  },
});

export const QmapSubjectType = new ObjectType({
  name: 'QmapSubjectType',
  description: 'Subject details in each Qmap object',
  fields: {
    name: { type: StringType, description: 'Name of the Subject' },
    code: { type: StringType, description: 'System generated subject code' },
  },
});


export const InputQmapTopicType = new InputObjectType({
  name: 'InputQmapTopicType',
  description: 'Topic details in each Qmap object',
  fields: {
    name: { type: StringType, description: 'Name of the Topic' },
    code: { type: StringType, description: 'Topic code given by the user at time of adding Concept taxonomy in Settings' },
  },
});

export const QmapTopicType = new ObjectType({
  name: 'QmapTopicType',
  description: 'Topic details in each Qmap object',
  fields: {
    name: { type: StringType, description: 'Name of the Topic' },
    code: { type: StringType, description: 'Topic code given by the user at time of adding Concept taxonomy in Settings' },
  },
});

export const InputQmapsubTopicType = new InputObjectType({
  name: 'InputQmapsubTopicType',
  description: 'subTopic details in each Qmap object',
  fields: {
    name: { type: StringType, description: 'Name of the subTopic' },
    code: { type: StringType, description: 'Code given by the user at time of question mapping in test creation' },
  },
});

export const QmapsubTopicType = new ObjectType({
  name: 'QmapsubTopicType',
  description: 'subTopic details in each Qmap object',
  fields: {
    name: { type: StringType, description: 'Name of the subTopic' },
    code: { type: StringType, description: 'Code given by the user at time of question mapping in test creation' },
  },
});

export const InputQmapType = new InputObjectType({
  name: 'InputQmapType',
  description: 'Mapping the question with subject, topic and subTopic',
  fields: {
    questionNumber: { type: new NonNull(StringType), description: 'Quetion number in specified format, ex: Q1,Q2, etc..' },
    subject: { type: new NonNull(InputQmapSubjectType), description: 'Subject details in each Qmap object' },
    topic: { type: new NonNull(InputQmapTopicType), description: 'Topic details in each Qmap object' },
    subTopic: { type: InputQmapsubTopicType, description: 'subTopic details in each Qmap object' },
    difficulty: { type: StringType, description: 'Difficulty of the question in enumerated form of Easy, Medium and Hard' },
  },
});

export const QmapType = new ObjectType({
  name: 'QmapType',
  description: 'Mapping the question with subject, topic and subTopic',
  fields: {
    questionNumber: { type: StringType, description: 'Quetion number in specified format, ex: Q1,Q2, etc..' },
    subject: { type: QmapSubjectType, description: 'Subject details in each Qmap object' },
    topic: { type: QmapTopicType, description: 'Topic details in each Qmap object' },
    subTopic: { type: QmapsubTopicType, description: 'subTopic details in each Qmap object' },
    difficulty: { type: StringType, description: 'Difficulty of the question in enumerated form of Easy, Medium and Hard' },
    C: { type: StringType, description: 'Marks for answering correctly to this question' },
    W: { type: StringType, description: 'Marks for answering wrongly to this question' },
    U: { type: StringType, description: 'Marks for Not attempting this question' },
  },
});

export const ColorSchemaOjbectType = new ObjectType({
  name: 'ColorSchemaOjbectType',
  description: 'Color schema',
  fields: {
    color: { type: StringType, description: 'Defined color' },
    gt: { type: IntType, description: 'Greater than value' },
    lt: { type: IntType, description: 'Less than value' },
  },
});

export const TestType = new ObjectType({
  name: 'TestType',
  description: 'Test data',
  fields: {
    testId: { type: StringType, description: 'Unique identifier for the test' },
    academicYear: { type: StringType, description: 'Academic Year in which test was helds' },
    testName: { type: StringType, description: 'Name of the test' },
    testType: { type: TesttypeType, description: 'User defined test pattern' },
    totalMarks: { type: IntType, description: 'Total marks in the test' },
    startTime: { type: StringType, description: 'Time of exam starts' },
    date: { type: StringType, description: 'Date of conducting the test.' },
    duration: { type: IntType, description: 'Test duration in number of minutes' },
    subjects: { type: new List(SubjectType), description: 'Subjects in the test' },
    subjectsordered: { type: BooleanType, description: 'Subjects ordered or not' },
    hierarchyTag: { type: StringType, description: 'Unique identifier for hierarchy' },
    markingSchema: { type: GraphQLJSON, description: 'Marks distribution' },
    Qmap: { type: new List(QmapType), description: 'Question mapping with subject, topic and subTopic' },
    questionPaperUrl: { type: StringType, description: 'Question paper url' },
    questionPaperId: { type: StringType, description: 'Question paper ID' },
    qPageMapping: { type: GraphQLJSON, description: 'Question number page mapping to scroll pdf' },
    selectedHierarchy: { type: SelectedHierarhcyType, description: 'Highest level of hierarchy selected by the user' },
    totalStudents: { type: IntType, description: 'Number of students participating in the test' },
    studentsUploaded: { type: IntType, description: 'Number of student whose results uploaded' },
    percentage: { type: FloatType, description: 'Percentage of result uploaded students' },
    stepsCompleted: { type: IntType, description: 'Number of steps completed in test creation' },
    totalSteps: { type: IntType, description: 'Total steps in test creation' },
    status: { type: StringType, description: 'Current status of the test' },
    colorSchema: { type: new List(ColorSchemaOjbectType), description: 'color schema' },
    gaStatus: { type: StringType, description: 'Current GA Status of the test. Possible State: [not_started,pending,error,finished]' },
  },
});

export const StudentTestType = new ObjectType({
  name: 'StudentTestType',
  description: 'Test data',
  fields: {
    testId: { type: StringType, description: 'Unique identifier for the test' },
    academicYear: { type: StringType, description: 'Academic Year in which test was helds' },
    testName: { type: StringType, description: 'Name of the test' },
    testType: { type: TesttypeType, description: 'User defined test pattern' },
    totalMarks: { type: IntType, description: 'Total marks in the test' },
    startTime: { type: StringType, description: 'Time of exam starts' },
    date: { type: StringType, description: 'Date of conducting the test.' },
    duration: { type: IntType, description: 'Test duration in number of minutes' },
    subjects: { type: new List(SubjectType), description: 'Subjects in the test' },
    markingSchema: { type: GraphQLJSON, description: 'Marks distribution' },
    status: { type: StringType, description: 'Current status of the test' },
    colorSchema: { type: new List(ColorSchemaOjbectType), description: 'color schema' },
    gaStatus: { type: StringType, description: 'Current GA Status of the test. Possible State: [not_started,pending,error,finished]' },
  },
});

export const InputTestType = new InputObjectType({
  name: 'InputTestType',
  description: 'Input for the test',
  fields: {
    testName: { type: new NonNull(StringType), description: 'Name of the test, testName should not be empty! ' },
    totalMarks: { type: new NonNull(IntType), description: 'totalMarks in the test' },
    date: { type: new NonNull(StringType), description: 'Date of conducting the test.' },
    startTime: { type: new NonNull(StringType), description: 'Time of test starts, should be in range 00:00 to 23:59' },
    duration: { type: new NonNull(IntType), description: 'Number of minutes of the test duration' },
    selectedHierarchy: { type: new NonNull(InputSelectedHierarhcyType), description: '  Highest level of hierarchy selected by the user' },
    testType: { type: new NonNull(InputTesttypeType), description: 'Mode of exam for the test' },
    hierarchy: { type: new NonNull(new List(InputHierarchyType)), description: 'Selected hierarchy for the test'}, // eslint-disable-line
    subjects: { type: new NonNull(new List(InputSubjectType)), description: 'Selected subjects for the test' },
    subjectsordered: { type: BooleanType, description: 'Subjects ordered or not' },
    markingSchema: { type: MarkingSchemaType, description: 'Marks distribution' },
    // Qmap: { type: InputQmapType, description: 'Question wise description' },
  },
});


export const FileStatusType = new ObjectType({
  name: 'FileStatusType',
  description: 'Check status of the parsing document file',
  fields: {
    fileStatusId: { type: StringType, description: 'Unique identifier for a specific file passed to the parser' },
    status: { type: IntType, description: 'Status of the file' },
    statusMessage: { type: StringType, description: 'Message about current status of the file' },
  },
});

export const InputColorSchemaOjbectType = new InputObjectType({
  name: 'InputColorSchemaOjbectType',
  description: 'Color schema',
  fields: {
    color: { type: new NonNull(StringType), description: 'Defined color' },
    gt: { type: new NonNull(IntType), description: 'Greater than value' },
    lt: { type: new NonNull(IntType), description: 'Less than value' },
  },
});


export const UpdateTestType = new InputObjectType({
  name: 'UpdateTestType',
  description: 'Any number of defined fields get updated',
  fields: {
    testId: { type: new NonNull(StringType), description: 'Unique identifier for test' },
    testName: { type: StringType, description: 'Name of the test, testName should not be empty! ' },
    totalMarks: { type: IntType, description: 'totalMarks in the test' },
    date: { type: StringType, description: 'Date of conducting the test.' },
    startTime: { type: StringType, description: 'Time of test starts, should be in range 00:00 to 23:59' },
    duration: { type: IntType, description: 'Number of minutes of the test duration' },
    selectedHierarchy: { type: InputSelectedHierarhcyType, description: '  Highest level of hierarchy selected by the user' },
    testType: { type: InputTesttypeType, description: 'Mode of exam for the test' },
    hierarchy: { type: new List(InputHierarchyType), description: 'Selected hierarchy for the test'}, // eslint-disable-line
    subjectsordered: { type: BooleanType, description: 'Subjects ordered or not' },
    subjects: { type: new List(InputSubjectType), description: 'Selected subjects for the test' },
    markingSchema: { type: MarkingSchemaType, description: 'Marks distribution' },
    Qmap: { type: new List(InputQmapType), description: 'Mapping the question with subject, topic and subTopic' },
    colorSchema: { type: new List(InputColorSchemaOjbectType), description: 'color schema' },
  },
});

export const TestHierarchyNodesType = new ObjectType({
  name: 'TestHierarchyNodesType',
  description: 'Hierarchy nodes of the test',
  fields: {
    isLeafNode: { type: BooleanType, description: 'Node is a leaf node or not' },
    childCode: { type: StringType, description: 'Internal code for the node' },
    child: { type: StringType, description: 'Name of the node' },
    parentCode: { type: StringType, description: 'Internal code of the parent' },
    parent: { type: StringType, description: 'Name of the paretn' },
    level: { type: IntType, description: 'Level of the node' },
    hierarchyTag: { type: StringType, description: 'Unique identifier of the test hierarchy nodes' },
    selected: { type: BooleanType, description: 'Node is selected in the hierarchy or not' },
    numberOfStudents: { type: IntType, description: 'Total number of students participating in this node' },
    percentage: { type: FloatType, description: 'Upload percentage' },
    // Qmap:{ type: QmapSchema, description: 'Question wise description' },
  },
});

export const MoveTestType = new ObjectType({
  name: 'MoveTestType',
  description: 'MoveTestType',
  fields: {
    testId: { type: StringType, description: 'Test ID' },
    status: { type: StringType, description: 'Status' },
  },
});

export const ErrorListType = new ObjectType({
  name: 'ErrorListType',
  description: 'Errors List Item type',
  fields: {
    errorCode: { type: StringType, description: 'Internal Error code' },
    errorMessage: { type: StringType, description: 'Message to be displayed for the given Error code.' },
    data: { type: GraphQLJSON, description: 'List of Errors occured on the given error code.' },
  },
});

export const QmapFileUploadType = new ObjectType({
  name: 'QmapFileUploadType',
  description: 'List of all the the Errors occured',
  fields: {
    data: { type: TestType, description: 'TestType data' },
    errors: { type: new List(ErrorListType), description: 'errors' },
  },
});
export const pageInfoType = new ObjectType({
  name: 'TestPageInfo',
  fields() {
    return {
      pageNumber: {
        type: IntType,
      },
      nextPage: {
        type: BooleanType,
      },
      prevPage: {
        type: BooleanType,
      },
      totalPages: {
        type: IntType,
      },
      totalEntries: {
        type: IntType,
      },
    };
  },
});

export const StudentTestsDetailsType = new ObjectType({
  name: 'StudentTestsDetailsType',
  fields() {
    return {
      page: {
        type: new List(StudentTestType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});

export const TestsDetailsType = new ObjectType({
  name: 'TestsDetailsType',
  fields() {
    return {
      page: {
        type: new List(TestType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});


export default{
  TestType,
  InputTestType,
  UpdateTestType,
  MarkingSchemaType,
  TestHierarchyNodesType,
  FileStatusType,
  MoveTestType,
  QmapFileUploadType,
  pageInfoType,
  StudentTestsDetailsType,
  TestsDetailsType,
};
