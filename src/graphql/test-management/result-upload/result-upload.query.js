import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  // GraphQLList as List,
  GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import fetch from '../../../utils/fetch';
// import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';
import { ResultType, SampleDownloadType } from './result-upload.type';

const ResultInputType = new InputObjectType({
  name: 'ResultInputType',
  description: 'result filters input type',
  fields: {
    testId: { type: new NonNull(StringType), description: 'unique id of the test' },
    childCode: { type: StringType, description: 'childCode of the leaf Node' },
  },
});

const SampleResultUploadType = new InputObjectType({
  name: 'SampleResultUploadType',
  description: 'Input arguments to download sample result',
  fields: {
    testId: { type: new NonNull(StringType), description: 'unique id of the test' },
  },
});

export const Results = {
  args: {
    input: { type: new NonNull(ResultInputType) },
  },
  type: ResultType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload/read/results`;
    const body = JSON.parse(JSON.stringify(args.input));
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

export const ResultsSampleDownload = {
  args: {
    input: { type: new NonNull(SampleResultUploadType) },
  },
  type: SampleDownloadType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/resultUpload`;
    const body = JSON.parse(JSON.stringify(args.input));
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

export default { Results, ResultsSampleDownload };
