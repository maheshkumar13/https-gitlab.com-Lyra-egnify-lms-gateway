import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';
import { ResultType } from './result-upload.type';
import fetch from '../../../utils/fetch';


const HierarchyNodeInputType = new InputObjectType({
  name: 'HierarchyNodeInputType',
  description: 'hierarchy node type',
  fields: {
    child: { type: new NonNull(StringType), description: 'name of the node' },
    childCode: { type: new NonNull(StringType), description: 'unqiue code of the node' },
    parent: { type: new NonNull(StringType), description: 'name of the parent node' },
    parentCode: { type: new NonNull(StringType), description: 'unqiue code of the parent node' },
    hierarchyTag: { type: new NonNull(StringType), description: 'unqiue code to identify the institute hierarchy for the given test' },
    level: { type: new NonNull(IntType), description: 'level number' },
  },
});

const UploadResultV2InputType = new InputObjectType({
  name: 'UploadResultInputTypeV2',
  description: 'upload result input type',
  fields: {
    testId: { type: new NonNull(StringType), description: 'unique id of the test' },
    fileUrl: { type: new NonNull(StringType), description: 'url of the file uploaded' },
  },
});

const UploadResultInputType = new InputObjectType({
  name: 'UploadResultInputType',
  description: 'upload result input type',
  fields: {
    testId: { type: new NonNull(StringType), description: 'unique id of the test' },
    fileUrl: { type: new NonNull(StringType), description: 'url of the file uploaded' },
    path: { type: new List(HierarchyNodeInputType), description: 'List of institute hierarchy nodes present along the path' },
  },
});

const ConfirmMissingInputType = new InputObjectType({
  name: 'ConfirmMissingInputType',
  description: 'confirm mssing input type',
  fields: {
    testId: { type: new NonNull(StringType), description: 'unique id of the test' },
    path: { type: new List(HierarchyNodeInputType), description: 'List of institute hierarchy nodes present along the path' },
  },
});


export const uploadResult = {
  args: {
    input: { type: new NonNull(UploadResultInputType) },
  },
  // type: ResultType,
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/create`;
    const body = JSON.parse(JSON.stringify(args.input));
    body.path = JSON.stringify(body.path);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status === 403) {
          return new Error(response.statusText);
        }
        return response.json();
      }).then(json => json);
  },
};


export const uploadResultV2 = {
  args: {
    input: { type: new NonNull(UploadResultV2InputType) },
  },
  // type: ResultType,
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/v2/create`;
    const body = JSON.parse(JSON.stringify(args.input));
    body.path = JSON.stringify(body.path);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status === 403) {
          return new Error(response.statusText);
        }
        return response.json();
      }).then(json => json);
  },
};

export const updateUploadedResultV2 = {
  args: {
    input: { type: new NonNull(UploadResultV2InputType) },
  },
  // type: ResultType,
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/update`;
    const body = JSON.parse(JSON.stringify(args.input));
    body.path = JSON.stringify(body.path);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status === 403) {
          return new Error(response.statusText);
        }
        return response.json();
      }).then(json => json);
  },
};

export const updateUploadedResult = {
  args: {
    input: { type: new NonNull(UploadResultInputType) },
  },
  // type: ResultType,
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/update`;
    const body = JSON.parse(JSON.stringify(args.input));
    body.path = JSON.stringify(body.path);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status === 403) {
          return new Error(response.statusText);
        }
        return response.json();
      }).then(json => json);
  },
};

export const comfirmMissing = {
  args: {
    input: { type: new NonNull(ConfirmMissingInputType) },
  },
  type: ResultType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/update/confirmMissing`;
    const body = JSON.parse(JSON.stringify(args.input));
    body.path = JSON.stringify(body.path);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status === 403) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json);
  },
};

export const deleteResult = {
  args: {
    input: { type: new NonNull(ConfirmMissingInputType) },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/delete`;
    const body = JSON.parse(JSON.stringify(args.input));
    body.path = JSON.stringify(body.path);
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status === 403) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json);
  },
};

export default { uploadResult, updateUploadedResult };
