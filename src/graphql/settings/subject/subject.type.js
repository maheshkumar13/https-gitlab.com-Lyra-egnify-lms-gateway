/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLInputObjectType as InputType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

export const nameCodeType = new ObjectType({
  name: 'nameCodeType',
  fields: {
    name: { type: StringType, description: 'Name' },
    code: { type: StringType, description: 'Interal code' },
  },
});

export const refsType = new ObjectType({
  name: 'refsType',
  fields: {
    board: { type: nameCodeType, description: 'Name of the subject' },
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

export const SubjectInputType = new InputType({
  name: 'SubjectInputType',
  fields: {
    subject: { type: new NonNull(StringType), description: 'Name of the subject' },
    boards: { type: new NonNull(new List(StringType)), description: 'List board codes' },
    classes: { type: new NonNull(new List(StringType)), description: 'List of classes codes' }
  }
})

export default {
  SubjectType,
  SubjectInputType,
};
