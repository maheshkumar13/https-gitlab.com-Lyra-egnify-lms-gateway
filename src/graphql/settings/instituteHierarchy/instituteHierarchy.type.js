/**
@author Aakash Parsi
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

export const instituteHierarchyInputType = new ObjectType({
  name: 'refsType',
  fields: {
    boad: { type: nameCodeType, description: 'Name of the subject' },
    class: { type: nameCodeType, description: 'Interal code of the subject' },
    subjecttype: { type: nameCodeType, description: 'Subject type' },
  },
});

export const subsubjectsType = new ObjectType({
  name: 'subsubjectsType',
  fields: {
    name: { type: StringType, description: 'sub subject name' },
  },
});


export const SubjectType = new ObjectType({
  name: 'SubjectType',
  fields: {
    subject: { type: StringType, description: 'Name of the subject' },
    code: { type: StringType, description: 'Interal code of the subject' },
    subsubjects: { type: new List(subsubjectsType) },
    refs: { type: refsType, description: 'ref'}
  },
});

export default {
  SubjectType,
};
