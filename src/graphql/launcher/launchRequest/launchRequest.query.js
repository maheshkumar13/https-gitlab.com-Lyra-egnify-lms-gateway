/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLList as List,
  GraphQLBoolean as BooleanType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

import { LaunchRequestType, S3FileSystemType } from './launchRequest.type';

const controller = require('../../../api/launcher/launchRequest/launchRequest.controller');

export const LaunchRequest = {
  args: {
    key: { type: NonNull(StringType), description: 'Storage Key' },
  },
  type: LaunchRequestType,
  async resolve(obj, args, context) {
    // console.log(controller.getPreSignedUrl(args, context))
    return controller.getPreSignedUrl(args, context);
  },
};

export const GetS3FileSystem = {
  args: {
    key: { type: StringType, description: 'Storage Key' },
    html: { type: BooleanType, description: 'Should be true for html content' },
  },
  type: new List(S3FileSystemType),
  async resolve(obj, args, context) {
    return controller.getS3FileSystem(args, context);
  },
};

export default {
  LaunchRequest,
  GetS3FileSystem,
};
