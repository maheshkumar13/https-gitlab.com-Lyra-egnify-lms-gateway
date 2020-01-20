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

export default {
  LaunchRequestType,
  S3FileSystemType,
};
