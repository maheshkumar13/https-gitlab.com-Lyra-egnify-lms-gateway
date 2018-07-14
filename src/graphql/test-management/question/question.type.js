/**
@author KSSR
@data    12/05/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLFloat as FloatType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputObjectType,
  GraphQLEnumType as EnumType,
  GraphQLList as List,

} from 'graphql';


import GraphQLJSON from 'graphql-type-json';
import { TestType } from '../test/test.type';


const DifficultyEnumType = new EnumType({
  name: 'DifficultyEnumType',
  values: {
    Easy: {
      value: 'Easy',
    },
    Medium: {
      value: 'Medium',
    },
    Hard: {
      value: 'Hard',
    },
    Null: {
      value: null,
    },
  },
});

const ResponseEnumType = new EnumType({
  name: 'ResponseEnumType',
  values: {
    C: {
      value: 'C',
    },
    W: {
      value: 'W',
    },
    U: {
      value: 'U',
    },
    ADD: {
      value: 'ADD',
    },
  },
});

export const QuestionMappingDetailsInputType = new InputObjectType({
  name: 'QuestionMappingDetailsInputType',
  description: 'QuestionMappingDetailsInputType',
  fields: {
    qid: { type: new List(StringType), description: 'Qid of the Question' },
    testId: { type: new List(StringType), description: 'Test Id of the test' },
    questionNumber: { type: new List(StringType), description: 'Question no of the test' },
    subject: { type: new List(StringType), description: 'Name of the subject' },
    subjectCode: { type: new List(StringType), description: 'User defined subject code' },
    topic: { type: new List(StringType), description: 'Name of the topic' },
    topicCode: { type: new List(StringType), description: 'User defined topic code' },
    subTopic: { type: new List(StringType), description: 'Name of the topic' },
    subTopicCode: { type: new List(StringType), description: 'User defined topic code' },
    difficulty: { type: new List(DifficultyEnumType), description: 'User defined Difficulty of question' },
    questionType: { type: new List(StringType), description: 'Type of the Question' },

  },
});
export const QuestionMappingDetailsType = new ObjectType({
  name: 'QuestionMappingDetailsType',
  fields: {
    qid: { type: StringType, description: 'Qid of the Question' },
    testId: { type: StringType, description: 'Test Id of the test' },
    questionNumber: { type: StringType, description: 'Question no of the test' },
    subject: { type: StringType, description: 'Name of the subject' },
    subjectCode: { type: StringType, description: 'User defined subject code' },
    topic: { type: StringType, description: 'Name of the topic' },
    topicCode: { type: StringType, description: 'User defined topic code' },
    subTopic: { type: StringType, description: 'Name of the topic' },
    subTopicCode: { type: StringType, description: 'User defined topic code' },
    difficulty: { type: StringType, description: 'User defined Difficulty of question' },
    questionType: { type: StringType, description: 'Type of the Question' },
    key: { type: new List(StringType), description: 'Keys of the Question' },

  },

});

const FieldnameEnumType = new EnumType({
  name: 'FieldnameEnumType',
  values: {
    STUDENT_NAME: {
      value: 'name',
    },
    RANK_OVERALL: {
      value: 'filter.rankAnalysis.overall.rank',
    },
    MARK_OVERALL: {
      value: 'filter.markAnalysis.overall.obtainedMarks',
    },
  },
});
const SortingOrderEnumType = new EnumType({
  name: 'SortingOrderEnumType',
  values: {
    ASC: {
      value: 1,
    },
    DESC: {
      value: -1,
    },
  },
});
export const SortType = new InputObjectType({
  name: 'SortType',
  description: 'Sorting Input for Question Details',
  fields: {
    fieldName: { type: FieldnameEnumType },
    sortOrder: { type: SortingOrderEnumType },
  },
});
// const GraphQLStringType = require('graphql-StringType');
export const QuestionDetailsInputType = new InputObjectType({
  name: 'QuestionDetailsInputType',
  description: 'Input for Question Details query',
  fields: {
    qid: { type: new List(StringType), description: 'Qid of the Question' },
    testId: { type: new List(StringType), description: 'Test Id of the test' },
    questionNumber: { type: new List(StringType), description: 'Question no of the test' },
    subject: { type: new List(StringType), description: 'Name of the subject' },
    subjectCode: { type: new List(StringType), description: 'User defined subject code' },
    topic: { type: new List(StringType), description: 'Name of the topic' },
    topicCode: { type: new List(StringType), description: 'User defined topic code' },
    subTopic: { type: new List(StringType), description: 'Name of the topic' },
    subTopicCode: { type: new List(StringType), description: 'User defined topic code' },
    difficulty: { type: new List(DifficultyEnumType), description: 'User defined Difficulty of question' },
    questionType: { type: new List(StringType), description: 'Type of the Question' },
    questionResponse: { type: new List(ResponseEnumType) },
    pageNumber: { type: IntType },
    limit: { type: IntType },
    sort: { type: new List(SortType) },
  },
});


const pageInfoType = new ObjectType({
  name: 'TestPageInfomation',
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


const MarkAnalysisDataType = new ObjectType({
  name: 'QuestionDetailsMarkAnalysisDataType',
  description: 'Mark Analysis Values',
  fields: {
    obtainedMarks: { type: FloatType, description: 'Total Obtained Marks' },
    totalMarks: { type: FloatType, description: 'Totals Marks That Can Be Obtained' },
    percentage: { type: FloatType, description: 'Percentage' },
  },
});


const MarkAnalysisType = new ObjectType({
  name: 'QuestionDetailsMarkAnalysisType',
  description: 'Mark Analysis',
  fields: {
    subject: { type: StringType, description: 'subject code or name' },
    data: { type: MarkAnalysisDataType, description: 'Mark analysis data type' },
  },
});

const RankAnalysisDataType = new ObjectType({
  name: 'QuestionDetailsRankAnalysisDataType',
  description: 'Rank Analysis Values',
  fields: {
    rank: { type: FloatType, description: 'Rank Obtained' },
  },
});

const RankAnalysisType = new ObjectType({
  name: 'QuestionDetailsRankAnalysisType',
  description: 'Rank Analysis',
  fields: {
    subject: { type: StringType, description: 'subject code or name' },
    data: { type: RankAnalysisDataType, description: 'Rank analysis data type' },
  },
});
const CWUAnalysisDataType = new ObjectType({
  name: 'QuestionDetailsCWUAnalysisDataType',
  description: 'CWU Analysis Values',
  fields: {
    C: { type: FloatType, description: 'Number of Correct' },
    W: { type: FloatType, description: 'Numbers of Wrong' },
    U: { type: FloatType, description: 'Number of Unattempted' },
    UW: { type: FloatType, description: 'Number of Unattempted + Wrong' },
  },
});
const CWUAnalysisType = new ObjectType({
  name: 'QuestionDetailsCWUAnalysisType',
  description: 'CWU Analysis',
  fields: {
    subject: { type: StringType, description: 'subject code or name' },
    data: { type: CWUAnalysisDataType, description: 'CWU analysis data type' },
  },
});
export const QuestionDetailsDataType = new ObjectType({
  name: 'QuestionDetailsDataType',
  description: 'Coomon Reports per Student',
  fields: {
    _id: { type: StringType },
    active: { type: BooleanType },
    hierarchyLevels: { type: GraphQLJSON, description: 'Hierarch Levels of the particular student' },

    // student data
    studentId: { type: StringType, description: 'ID of the Student' },
    studentMetaData: { type: GraphQLJSON, description: 'Student Meta Data' },
    name: { type: StringType, description: 'Name of the Student' },
    // test data
    testId: { type: StringType, description: 'ID of the Test' },
    testMetaData: { type: TestType, description: 'Test Meta Data' },
    QMap: { type: GraphQLJSON, description: 'Individual question information like subtopic, topic, subject, CWU' },
    QMapArray: { type: GraphQLJSON, description: 'Individual question information like subtopic, topic, subject, CWU' },

    // // Analysis
    reponseQuestionsMap: { type: GraphQLJSON, description: 'List of Question Having a specific Response' },
    responseData: { type: GraphQLJSON, description: 'Key-Value pairs of questionResponse and questionMarks' },
    cwuAnalysis: { type: new List(CWUAnalysisType), description: 'CWU Analysis of an Invidual Student' },
    markAnalysis: { type: new List(MarkAnalysisType), description: 'Mark Analysis of an Invidual Student' },
    rankAnalysis: { type: new List(RankAnalysisType), description: 'Rank Analysis of an Invidual Student' },
    topicAnalysis: { type: GraphQLJSON, description: 'Topic Analysis of an Invidual Student' },
  },
});
export const QuestionDetailsType = new ObjectType({
  name: 'QuestionDetailsType',
  description: 'Output selected for the Question Details query',
  fields: {
    page: {
      type: new List(QuestionDetailsDataType),
    },
    pageInfo: { type: pageInfoType, description: 'Pagination Information' },
  },
});

export const questionErrorType = new ObjectType({
  name: 'questionErrorType',
  description: 'Question Error Type',
  fields: {
    isErroneous: { type: BooleanType },
    errorMessage: { type: StringType },
  },
});

export const questionOptionsType = new ObjectType({
  name: 'questionOptionsType',
  description: 'Question Options Type',
  fields: {
    optionText: { type: StringType },
    option: { type: StringType },
    error: { type: questionErrorType },
  },
});

export const GetQuestionsInputType = new InputObjectType({
  name: 'GetQuestionsInputType',
  description: 'Input for Get Questions query',
  fields: {
    questionPaperId: { type: StringType, description: 'Question Paper ID' },
    questionNumberId: { type: StringType, description: 'Question Number ID' },
    qno: { type: IntType, description: 'Question Number' },
    pageNumber: { type: IntType },
    limit: { type: IntType },
    parsed: { type: BooleanType },
  },
});

export const QuestionsType = new ObjectType({
  name: 'QuestionsType',
  description: '',
  fields: {
    qno: { type: IntType, default: null, description: 'Question Number' },
    questionNumberId: { type: StringType, default: null, description: 'Question Number ID' },
    question: { type: StringType, default: null, description: 'Question' },
    questionPaperId: { type: StringType, default: null, description: 'Question Paper ID' },
    questionFormatted: { type: StringType, default: null, description: 'Question Formatted' },
    isGlobalErroneous: { type: BooleanType },
    error: { type: questionErrorType },
    options: { type: new List(questionOptionsType), description: 'Options' },
    hint: { type: StringType, default: null, description: 'Hint' },
    solution: { type: StringType, default: null, description: 'Solution' },
    key: { type: new List(StringType), description: 'Answer key' },
    docxurl: { type: StringType, default: null, description: 'Docx URL' },
    skills: { type: new List(StringType) },
    active: { type: BooleanType, default: true },
  },
});

export const GetQuestionsType = new ObjectType({
  name: 'GetQuestionsType',
  description: 'Output for Get Questions query',
  fields: {
    questions: { type: new List(QuestionsType), description: '' },
    count: { type: IntType, description: '' },
  },
});

export default{
  QuestionDetailsInputType,
  QuestionDetailsType,
  GetQuestionsInputType,
  GetQuestionsType,
};
