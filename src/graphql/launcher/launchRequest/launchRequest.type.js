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
} from 'graphql';

export const LaunchRequestType = new ObjectType({
  name: 'LaunchRequestType',
  fields: {
    key: { type: NonNull(StringType), description: 'Key of the requested of media object' },
    preSignedUrl: { type: NonNull(StringType), description: 'Pre-signed URL to requested media object.' },
    expires: { type: NonNull(IntType), description: 'Link Expires in (ms).' },
  },
});

export default {
  LaunchRequestType,
};
