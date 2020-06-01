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

import {
  LaunchRequestType,
  S3FileSystemType,
  GetSignedUrlForUploadInputType,
  GetSignedUrlForUploadOutputType, } from './launchRequest.type';

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

export const GetS3SignedUrlForUpload = {
  args: {
    input: { type: GetSignedUrlForUploadInputType }
  },
  type: new List(GetSignedUrlForUploadOutputType),
  async resolve(obj, args, context) {
    return controller.getSignedUrlForUpload(args.input, context);
  },
};

export const checkS3FileOrFolderExist = {
  args: {
    html: { type: new NonNull(BooleanType), description: 'true if checking in html bucket, false if non html bucket'},
    folder: { type: new NonNull(BooleanType), description: 'true if checking for folder else false' },
    key: { type: new NonNull(StringType), description: 'Key to check' },
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    return controller.checkIfFileOrFolderExists(args, context);
  },
};

export default {
  LaunchRequest,
  GetS3FileSystem,
  GetS3SignedUrlForUpload,
};
