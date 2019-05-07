import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
  GraphQLNonNull as NonNull,
} from 'graphql';


const contentType = new ObjectType({
  name: 'ContentMappingContentType',
  fields: {
    name: { type: StringType, description: 'Conent name' },
    category: { type: StringType, description: 'Content category' },
    type: { type: StringType, description: 'Conent type' },
  },
});

const resourceType = new ObjectType({
  name: 'ContentMappingResourceType',
  fields: {
    key: { type: StringType, description: 'Key/path of the resource' },
    size: { type: StringType, description: 'resource size' },
    type: { type: StringType, description: 'resource type' },
  },
});

const publicationType = new ObjectType({
  name: 'ContentMappingPublicationType',
  fields: {
    publisher: { type: StringType, description: 'Name of publisher' },
    year: { type: StringType, description: 'Year of publication' },
  },
});

const refCodesType = new ObjectType({
  name: 'ContentMappingRefCodesType',
  fields: {
    code: { type: StringType, description: 'Internal code of reference' },
  },
});

const refsType = new ObjectType({
  name: 'ContentMappingRefsType',
  fields: {
    textbook: { type: refCodesType, description: 'Textbook reference' },
   	topic: { type: refCodesType, description: 'Topic reference' },
  },
});

export const ContentMappingType = new ObjectType({
  name: 'ContentMappingType',
  fields: {
    content: { type: contentType, description: 'Content details' },
    resource: { type: resourceType, description: 'Resource details' },
    refs: { type: refsType, description: 'References to the object' },
    orientation: { type: StringType, description: 'Orientation' },
    publication: { type: publicationType, description: 'Publication details' },
    category: { type: StringType, description: 'Category' },
    coins: { type: IntType, description: 'Coins' },
  },
});

export const CmsCategoryStatsInputType = new InputType({
  name: 'CmsCategoryStatsInputType',
  fields: {
    classCode: { type: StringType, description: 'Name of the class' },
    subjectCode: { type: StringType, description: 'Name of the subject' },
    chapterCode: { type: StringType, description: 'Name of the chapter' },
  },
});

export const CmsCategoryStatsOutputType = new ObjectType({
  name: 'CmsCategoryStatsOutputType',
  fields: {
    category: { type: StringType, description: 'Name of the category' },
    count: { type: IntType, description: 'Count of the files which belongs to that category' },
  },
});

export const CategoryWiseFilesInputType = new InputType({
  name: 'CategoryWiseFilesInputType',
  fields: {
    classCode: { type: StringType, description: 'Name of the class' },
    subjectCode: { type: StringType, description: 'Name of the subject' },
    chapterCode: { type: StringType, description: 'Name of the chapter' },
    category: { type: new NonNull(StringType), description: 'Name of the category' },
  },
});

export const CategoryWiseFilesOutputType = new ObjectType({
  name: 'CategoryWiseFilesOutputType',
  fields: {
    category: { type: StringType, description: 'Name of the category' },
    resource: { type: StringType, description: 'Url of the file' },
  },
});

export default {
  ContentMappingType,
  CmsCategoryStatsOutputType,
  CmsCategoryStatsInputType,
};
