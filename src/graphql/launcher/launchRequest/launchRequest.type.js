/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLInputObjectType as InputType,
  GraphQLList as List,
} from 'graphql';

import GraphQLDate from 'graphql-date';

export const LaunchRequestType = new ObjectType({
  name: 'LaunchRequestType',
  fields: {
    key: { type: NonNull(StringType), description: 'Key of the requested of media object' },
    preSignedUrl: { type: NonNull(StringType), description: 'Pre-signed URL to requested media object.' },
    expires: { type: NonNull(IntType), description: 'Link Expires in (ms).' },
  },
});

export const S3FileSystemType = new ObjectType({
  name: 'S3FileSystemType',
  fields: {
    fileName: { type: StringType, description: 'Name of the file' },
    key: { type: StringType, description: 'Storage key' },
    folder: { type: BooleanType, description: '' },
    lastModified: { type: GraphQLDate, description: 'Last modified timestamp' },
    size: { type: IntType, description: 'file size' },
  },
});

export const GetSignedUrlForUploadDataInputType = new InputType({
  name: 'GetSignedUrlForUploadDataInputType',
  fields: {
    key: { type: new NonNull(StringType), description: 'Storage key' },
    size: { type: new NonNull(IntType), description: 'File size' },
    contentType: { type: StringType, description: 'Content type' },
  },
});

export const GetSignedUrlForUploadInputType = new InputType({
  name: 'GetSignedUrlForUploadInputType',
  fields: {
    html: { type: BooleanType, description: 'Default false, send true for html content' },
    data: { type: new NonNull(new List(GetSignedUrlForUploadDataInputType)), description: 'input data' },
  },
});

export const GetSignedUrlForUploadOutputType = new ObjectType({
  name: 'GetSignedUrlForUploadOutputType',
  fields: {
    key: { type: StringType, description: 'Storage key' },
    size: { type: IntType, description: 'File size' },
    uploadUrl: { type: StringType, description: 'Url to upload the file' },
  },
});

export default {
  LaunchRequestType,
  S3FileSystemType,
};
