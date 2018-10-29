
import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLInputObjectType as InputObjectType,
    GraphQLEnumType as EnumType,
    GraphQLList as List,
  
  } from 'graphql';
  
import GraphQLJSON from 'graphql-type-json';

export const QuestionPaperMetricsInputType = new InputObjectType({
    name: 'QuestionPaperMetricsInputType',
    description: 'Input for Question Paper metrics query',
    fields: {
        questionPaperId: { type: StringType, description: 'Question Paper ID' },
    },
});

const OptionType = new ObjectType({
    name: 'OptionType',
    description: '',
    fields: {
        option: { type: StringType, description: '' },
        error: { type: StringType, description: '' },       
    },
});

const UnparsedErrorType = new ObjectType({
    name: 'UnparsedErrorType',
    description: '',
    fields: {
        qno: { type: IntType, description: ''},
        error: { type: StringType, description: '' },
        options: { type: new List(OptionType), description: '' },
    },
});

const TotalMetricsType = new ObjectType({
    name: 'TotalMetricsType',
    description: '',
    fields: {
        totalNumberOfQuestions: { type: IntType, description: '' },
        noOfQuestionsParsed: { type: IntType, description: '' },
        noOfQuestionsNotParsed: { type: IntType, description: '' },
        parsingPercentage: { type: IntType, description: '' },
    },
});

const MetricsSubjectType = new ObjectType({
    name: 'MetricsSubjectType',
    description: '',
    fields: {
        totalNumberOfQuestions: { type: IntType, description: '' },
        noOfQuestionsParsed: { type: IntType, description: '' },
        noOfQuestionsNotParsed: { type: IntType, description: '' },
        parsingPercentage: { type: IntType, description: '' },
        subjectName: { type: StringType, description: ''  },
        subject: { type: StringType, description: ''  }, 
    },
});

const MetricsType = new ObjectType({
    name: 'MetricsType',
    description: '',
    fields: {
        total: { type: TotalMetricsType, description: '' },
        subject: { type: new List(MetricsSubjectType), description: '' },
    },
});

export const QuestionPaperMetricsType = new ObjectType({
    name: 'QuestionPaperMetricsType',
    description: 'Output for the Question Paper metrics query',
    fields: {
        questionPaperId: { type: StringType, description: ''  },
        questionPaperName: { type: StringType, description: '' },
        fileUrl: { type: StringType, description: '' },
        parsed: { type: new List(IntType), description: '' },
        unParsed: { type: new List(IntType), description: '' },
        unParsedWithErrors: { type: new List(UnparsedErrorType), description: '' }, 
        active: { type: BooleanType, default: false, description: '' },
        metrics: { type: MetricsType, description: '' },
    },
});

export default{
    QuestionPaperMetricsInputType,
    QuestionPaperMetricsType,
};