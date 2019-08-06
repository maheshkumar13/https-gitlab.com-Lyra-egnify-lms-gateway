import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
  } from 'graphql';
  
  export const SearchResultType = new ObjectType({
    name: 'SearchResultType',
    fields: {
      title: { type: NonNull(StringType), description: 'Title of Asset' }
    },
  });
  
  export default {
    SearchResultType,
  };