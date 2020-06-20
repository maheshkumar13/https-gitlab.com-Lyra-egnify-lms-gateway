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
  GraphQLBoolean as BooleanType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

import { TextbookType } from '../textbook/textbook.type';
const textBookController = require('../../../api/settings/textbook/textbook.controller');

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
    isMandatory: { type: BooleanType, description: 'true/false' },
    subsubjects: { type: new List(subsubjectsType) },
    refs: { type: refsType, description: 'ref' },
    next: {
      type: new List(TextbookType),
      async resolve(obj, args, context) {
        args.subjectCode = obj.code;
        return textBookController.getTextbooks(args, context);
      },
    },
  },
});

export const SubjectInputType = new InputType({
  name: 'SubjectInputType',
  fields: {
    subject: { type: new NonNull(StringType), description: 'Name of the subject' },
    isMandatory: { type: BooleanType, description: 'is mandatory' },
    classes: { type: new NonNull(new List(StringType)), description: 'List of classes codes' }
  }
})

export const UpdateSubjectInputType = new InputType({
  name: 'UpdateSubjectInputType',
  fields: {
    subjectCode: { type: new NonNull(StringType), description: 'Code of the subject' },
    subject: { type: new NonNull(StringType), description: 'Name of the subject' },
    isMandatory: { type: BooleanType, description: 'is mandatory' },
    classCode: { type: new NonNull(StringType), description: 'Class code' }
  }
})


export default {
  SubjectType,
  SubjectInputType,
  UpdateSubjectInputType,
};
