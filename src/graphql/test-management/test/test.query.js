/**
   @author Aslam Shaik
   @date    14/03/2018
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLBoolean as BooleanType,
  GraphQLEnumType,
  validate,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';

import {
  UniqueTestDetailsType,
  MoveTestType,
  TestHierarchyNodesType,
  FileStatusType,
  StudentTestsDetailsType,
  TestsDetailsType,
  ModeOfConductEnumType,
  TestSubjectDetailsType,
  IntegerRangeType,
} from './test.type';

function fetchTest(url, args, context) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(args),
    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
  }, context)
    .then((response) => {
      if (response.status >= 400) {
        return new Error(response.statusText);
      }
      return response.json()
        .then((json) => {
          const data = {};
          data.page = json.tests;
          const pageInfo = {};
          pageInfo.prevPage = true;
          pageInfo.nextPage = true;
          pageInfo.pageNumber = args.pageNumber;
          pageInfo.totalPages = Math.ceil(json.count / args.limit)
            ? Math.ceil(json.count / args.limit)
            : 1;
          pageInfo.totalEntries = json.count;

          if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
            return new Error('Page Number is invalid');
          }

          if (args.pageNumber === pageInfo.totalPages) {
            pageInfo.nextPage = false;
          }
          if (args.pageNumber === 1) {
            pageInfo.prevPage = false;
          }
          if (pageInfo.totalEntries === 0) {
            pageInfo.totalPages = 0;
          }
          data.pageInfo = pageInfo;
          return data;
        });
    })
    .catch(err => new Error(err.message));
}

function modifyTestArgs(args) {
  if (args.regex !== undefined) { args.regex = args.regex.replace(/\s\s+/g, ' ').trim(); } //eslint-disable-line
  if (args.regex === '' || args.regex === ' ') {
    args.regex = undefined; // eslint-disable-line
  }
  if (!args.pageNumber) args.pageNumber = 1; // eslint-disable-line
  if (args.pageNumber < 1) {
    return { err: 'Page Number must be positive' };
  }
  return args;
}

const StatusEnumType = new GraphQLEnumType({
  name: 'StatusEnumType',
  values: {
    draft: {
      value: 'draft',
    },
    upcoming: {
      value: 'upcoming',
    },
    inprogress: {
      value: 'inprogress',
    },
    completed: {
      value: 'completed',
    },
  },
});


export const GetUniqueTestDetails = {
  args: {
    academicYearArgs: { type: new List(StringType) },
    testTypeArgs: { type: new List(StringType) },
  },
  type: UniqueTestDetailsType,
  async resolve(obj, args, context) {
    // console.info(args, context);
    const url = `${config.services.test}/api/v1/test/getUniqueTestDetails`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const TestsForStudentProfile = {
  args: {
    testId: { type: StringType },
    academicYear: { type: new List(StringType) },
    testType: { type: new List(StringType) },
    date: { type: new List(StringType) },
    regex: { type: StringType },
    status: { type: StatusEnumType },
    statusArray: { type: new List(StatusEnumType) },
    pageNumber: { type: IntType },
    limit: { type: IntType },
    modeOfConduct: { type: ModeOfConductEnumType },
    otpSyncStatus: { type: BooleanType },
    getTestCompletedByStudent: { type: BooleanType },
  },
  type: StudentTestsDetailsType,
  async resolve(obj, args, context) {
    const modifiedArgs = await modifyTestArgs(args);
    if (modifiedArgs.err) return new Error(modifiedArgs.err);
    const url = `${config.services.test}/api/v1/test/student`;
    return fetchTest(url, modifiedArgs, context);
  },
};

export const Tests = {
  args: {
    testId: { type: StringType },
    academicYear: { type: new List(StringType) },
    testType: { type: new List(StringType) },
    date: { type: new List(StringType) },
    regex: { type: StringType },
    status: { type: StatusEnumType },
    pageNumber: { type: IntType },
    limit: { type: IntType },
    modeOfConduct: { type: ModeOfConductEnumType },
    otpSyncStatus: { type: BooleanType },

  },
  type: TestsDetailsType,
  async resolve(obj, args, context) {
    const modifiedArgs = await modifyTestArgs(args);
    if (modifiedArgs.err) return new Error(modifiedArgs.err);
    const url = `${config.services.test}/api/v1/test`;
    return fetchTest(url, modifiedArgs, context);
  },
};


export const TestSubjectDetails = {
  args: {
    testIds: { type: new List(StringType) },
  },
  type: new List(TestSubjectDetailsType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/getSubjectsByTestId`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        } return response.json()
          .then((json) => {
            console.info(json[0].subjects);
            return json;
          });
      })
      .catch(err => new Error(err.message));
  },
};
export const TestColourSchemaDetails = {
  args: {
    testIds: { type: new List(StringType) },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/getColourSchemaByTestId`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        } return response.json()
          .then((json) => {
            console.info(json[0].subjects);
            return json;
          });
      })
      .catch(err => new Error(err.message));
  },
};

export const QuestionTypes = {
  type: new List(StringType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/questionTypes`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        } return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const FileStatus = {
  args: {
    fileStatusId: { type: new NonNull(StringType), description: 'Unique identifier for a specific file passed to the parser' },
  },
  type: FileStatusType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/question/fileStatus`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};
export const DefaultMarkingSchemas = {
  args: {
    testName: { type: StringType },
  },
  type: GraphQLJSON, // new List(MarkingSchemaType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/defaultMarkingSchemas`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const TestHierarchyNodes = {
  args: {
    isLeafNode: { type: BooleanType },
    childCode: { type: StringType },
    child: { type: StringType },
    parentCode: { type: new List(StringType) },
    parent: { type: StringType },
    level: { type: IntType },
    hierarchyTag: { type: StringType },
    selected: { type: BooleanType },
    numberOfStudents: { type: IntType },
    numberOfStudentsRange: { type: IntegerRangeType },
    filterNodesWithAllMissingStudents: { type: BooleanType },
  },
  type: new List(TestHierarchyNodesType), // new List(MarkingSchemaType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/hierarchy`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        } return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const TestHierarchyNodesofMultipleTests = {
  args: {
    testIds: { type: new NonNull(new List(StringType)) },
    isLeafNode: { type: BooleanType },
    childCode: { type: StringType },
    child: { type: StringType },
    parentCode: { type: new List(StringType) },
    parent: { type: StringType },
    level: { type: IntType },
    selected: { type: BooleanType },
    numberOfStudentsRange: { type: IntegerRangeType },
    filterNodesWithAllMissingStudents: { type: BooleanType },
  },
  type: new List(TestHierarchyNodesType), // new List(MarkingSchemaType),
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/hierarchy/read/testHierarchyNodes/multipletests`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },
};

export const moveTest = {
  args: {
    testId: { type: new NonNull(StringType) },
    status: { type: new NonNull(StringType) },
  },
  type: MoveTestType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/moveTest`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const DownloadSampleQmap = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Unique identifier for test' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/downloadSampleQmap`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export const DownloadSampleQmapV2 = {
  args: {
    testId: { type: new NonNull(StringType), description: 'Unique identifier for test' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/test/downloadSampleQmapV2`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export default {
  Tests,
  TestsForStudentProfile,
  QuestionTypes,
  FileStatus,
  DefaultMarkingSchemas,
  TestHierarchyNodes,
  moveTest,
  DownloadSampleQmap,
  TestSubjectDetails,
  TestColourSchemaDetails,
};
