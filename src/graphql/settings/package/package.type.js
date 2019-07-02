import {
    GraphQLList as List,
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,    
  } from 'graphql';  

const PackageTextbookType = new ObjectType({
    name: 'PackageTextbookType',
    fields: {
      textbookCode: { type: StringType },
      textbookName: { type: StringType },
    },
  });  

export const SubjectDetailsType = new ObjectType({
    name: 'SubjectDetailsType',
    fields: {
      subjectName: { type: StringType },
      subjectCode: { type: StringType },
      textBooks: { type: new List(PackageTextbookType) },
    },
  });
  

export default {
    SubjectDetailsType,
};