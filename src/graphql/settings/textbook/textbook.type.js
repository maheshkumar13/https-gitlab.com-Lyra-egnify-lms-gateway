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

import { ConceptTaxonomyType } from '../conceptTaxonomy/conceptTaxonomy.type';

const ConceptTaxonomyTypeController = require('../../../api/settings/conceptTaxonomy/concpetTaxonomy.controller');


export const nameCodeType = new ObjectType({
  name: 'TextbookNameCodeType',
  fields: {
    name: { type: StringType, description: 'Name' },
    code: { type: StringType, description: 'Interal code' },
  },
});

export const refsType = new ObjectType({
  name: 'TextbookRefsType',
  fields: {
    class: { type: nameCodeType, description: 'Class' },
    subject: { type: nameCodeType, description: 'Subject' },
  },
});

export const TextbookType = new ObjectType({
  name: 'TextbookType',
  fields: {
    name: { type: StringType, description: 'Name of the textbook' },
    code: { type: StringType, description: 'Interal code of the subject' },
    imageUrl: { type: StringType, description: 'image url' },
    publisher: { type: StringType, description: 'Publisher name' },
    orientations: { type: GraphQLJSON, description: 'List of Orientations' },
    branches: { type: new List(StringType), description: 'List of Branches' },
    refs: { type: refsType, description: 'refs' },
    next: {
      type: new List(ConceptTaxonomyType),
      async resolve(obj, args, context) {
        args.textbookCode = obj.code;
        args.levelName = 'topic';
        return ConceptTaxonomyTypeController.fetchNodes(args, context);
      },
    },
  },
});

export const TextbookInputType = new InputType({
  name: 'TextbookInputType',
  fields: {
    name: { type: new NonNull(StringType), description: 'Name of the textbook' },
    classCode: { type: new NonNull(StringType), description: 'childCode of class' },
    subjectCode: { type: new NonNull(StringType), description: 'Internal code of subject' },
    imageUrl: { type: StringType, description: 'image url' },
    publisher: { type: StringType, description: 'Publisher name' },
    orientations: { type: new List(StringType), description: 'List Of Orientations' },
    branches: { type: new List(StringType), description: 'List of branches names' },
  },
});

export const updateTextbookInputType = new InputType({
  name: 'updateTextbookInputType',
  fields: {
    name: { type: StringType, description: 'Name of the textbook' },
    imageUrl: { type: StringType, description: 'image url' },
    publisher: { type: StringType, description: 'Publisher name' },
    code: { type: new NonNull(StringType), description: 'Internal code of textbook' },
    orientations: { type: new List(StringType), description: 'List Of Orientations' },
    branches: { type: new List(StringType), description: 'List of branches name' },
  },
});
export const classType = new ObjectType({
  name: 'classType',
  fields: {
    name: { type: StringType, description: 'class name' },
    code: { type: StringType, description: 'class code' },
  },
});
export const subjectType = new ObjectType({
  name: 'subjectType',
  fields: {
    name: { type: StringType, description: 'subject name' },
    code: { type: StringType, description: 'subject code' },
    viewOrder: { type: StringType, description: 'subject viewOrder' },
  },
});
export const textbookType = new ObjectType({
  name: 'textbookType',
  fields: {
    name: { type: StringType, description: 'textbook name' },
    code: { type: StringType, description: 'textbook code' },
    viewOrder: { type: StringType, description: 'textbook viewOrder' },
  },
});
export const chapterType = new ObjectType({
  name: 'chapterType',
  fields: {
    name: { type: StringType, description: 'chapter name' },
    code: { type: StringType, description: 'chapter code' },
    viewOrder: { type: StringType, description: 'chapter viewOrder' },
  },
});
export const ChapterWiseTextbookListOutputType = new ObjectType({
  name: 'ChapterWiseTextbookListOutputType',
  fields: {
    class: { type: classType, description: 'class details' },
    subject: { type: subjectType, description: 'subject details' },
    textbook: { type: textbookType, description: 'textbook details' },
    chapter: { type: chapterType, description: 'chapter details' },
  },
});

export default {
  TextbookType,
  TextbookInputType,
  updateTextbookInputType,
  nameCodeType,
  ChapterWiseTextbookListOutputType,
};
