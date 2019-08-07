import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
  } from 'graphql';
  
  export const SearchResultType = new ObjectType({
    name: 'SearchResultType',
    fields: {
      title: { type: NonNull(StringType), description: 'Title of Asset' },
      id : { type : NonNull(StringType) , description : "mongoose id for transactions"},
      type : { type : NonNull(StringType), description : "Asset Type"}
    }
  });
  
  export default {
    SearchResultType
  };