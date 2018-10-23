import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLInputObjectType as InputObjectType,
  GraphQLEnumType,

} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

// const GraphQLDate = require('graphql-date');

export const ErrorListItemType = new ObjectType({
  name: 'ErrorListItemType',
  description: 'Errors List Item type',
  fields: {
    errorCode: { type: StringType, description: 'Internal Error code' },
    message: { type: StringType, description: 'Message to be displayed for the given Error code.' },
    dataList: { type: GraphQLJSON, description: 'List of Errors occured on the given error code.' },
  },
});

export const ErrorsType = new ObjectType({
  name: 'ErrorsType',
  description: 'List of all the the Errors occured',
  fields: {
    testId: { type: new List(ErrorListItemType), description: 'Errors on tes id' },
    path: { type: new List(ErrorListItemType), description: 'Errors on path' },
    fileUrl: { type: new List(ErrorListItemType), description: 'Errors on csv Url' },
  },
});

export const WarningListItemType = new ObjectType({
  name: 'WarningListType',
  description: 'Warning type',
  fields: {
    warningCode: { type: StringType, description: 'Internal Error code' },
    message: { type: StringType, description: 'Message to be displayed for the given Error code.' },
    dataList: { type: GraphQLJSON, description: 'List of Errors occured on the given error code.' },
  },
});

export const WarningsType = new ObjectType({
  name: 'WarningsType',
  description: 'List of all the the Errors occured',
  fields: {
    testId: { type: new List(WarningListItemType), description: 'warnings on file Url' },
    path: { type: new List(WarningListItemType), description: 'warnings on  path' },
    fileUrl: { type: new List(WarningListItemType), description: 'warnings on file url' },
  },
});

export const DataType = new ObjectType({
  name: 'DataType',
  description: 'Type of data for results',
  fields: {
    testName: { type: StringType, description: 'Name of the Test' },
    testId: { type: StringType, description: 'unique id of the test' },
    hierarchyPath: { type: GraphQLJSON, description: 'List of nodes present along path of the leaf node' },
    leafNode: { type: StringType, description: 'Leaf Node for which the results are being uploaded' },
    csvUrl: { type: StringType, description: 'CSV results file uploaded' },
    missingStudents: { type: GraphQLJSON, description: 'List of Students Missing in the result uploaded' },
    missingStudentsConfirmed: {
      type: BooleanType,
      description: 'boolean variable checking if missing students are confirmed',
    },
  },
});

export const ResultType = new ObjectType({
  name: 'ResultType',
  description: 'details of result upload',
  fields: {
    data: { type: new List(DataType), description: 'data' },
    errors: { type: ErrorsType, description: 'errors' },
    warnings: { type: WarningsType, description: 'warnings' },
  },
});

export const SampleDownloadType = new ObjectType({
  name: 'SampleDownloadType',
  description: '',
  fields: {
    data: { type: StringType, description: 'File Headers (csv String) of the sample file' },
  },
});

const FilterNameEnumType = new GraphQLEnumType({
  name: 'FilterNameEnumTypeForOnlineStudents',
  values: {
    hierarchyFilter: {
      value: 'hierarchyLevels',
    },
  },
});

export const FilterInputType = new InputObjectType({
  name: 'FilterForOnlineStudents',
  description: 'Filters For Graph QL Calls',
  fields: {
    filterName: { type: FilterNameEnumType },
    values: { type: new List(GraphQLJSON) },
  },
});

const OnlineStudentDataType = new ObjectType({
  name: 'OnlineStudentDataType',
  fields: {
    egnifyId: { type: StringType },
    studentId: { type: StringType },
    studentName: { type: StringType },
    fatherName: { type: StringType },
    phone: { type: StringType },
    email: { type: StringType },
    gender: { type: StringType },
    dob: { type: StringType },
    category: { type: StringType },
    hierarchy: { type: GraphQLJSON },
    testId: { type: StringType },
    testName: { type: StringType },

  },
});
export const pageInfoType = new ObjectType({
  name: 'OnlineStudentTypePageInfo',
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

export const OnlineStudentType = new ObjectType({
  name: 'OnlineStudentType',
  fields() {
    return {
      page: {
        type: new List(OnlineStudentDataType),
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});


export default {
  ErrorsType, ErrorListItemType, ResultType, SampleDownloadType, FilterInputType, OnlineStudentType,
};
