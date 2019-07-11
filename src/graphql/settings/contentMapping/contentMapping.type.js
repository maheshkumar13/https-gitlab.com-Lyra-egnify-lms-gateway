import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLBoolean as BooleanType,
  GraphQLInputObjectType as InputType,
  GraphQLNonNull as NonNull,
  GraphQLList as List,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

const contentType = new ObjectType({
  name: 'ContentMappingContentType',
  fields: {
    name: { type: StringType, description: 'Content name' },
    category: { type: StringType, description: 'Content category' },
    type: { type: StringType, description: 'Content type' },
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
    orientation: { type: new List(StringType), description: 'Orientation' },
    publication: { type: publicationType, description: 'Publication details' },
    category: { type: StringType, description: 'Category' },
    metaData: { type: GraphQLJSON, description: 'metadata' },
    coins: { type: IntType, description: 'Coins' },
  },
});

export const CmsCategoryStatsInputType = new InputType({
  name: 'CmsCategoryStatsInputType',
  fields: {
    studentId: { type: StringType, description: 'StudentId' },
    classCode: { type: StringType, description: 'Code of the class' },
    subjectCode: { type: StringType, description: 'Code of the subject' },
    chapterCode: { type: StringType, description: 'Code of the chapter' },
    textbookCode: { type: StringType, description: 'Code of the textBook' },
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
    classCode: { type: StringType, description: 'Code of the class' },
    subjectCode: { type: StringType, description: 'Code of the subject' },
    chapterCode: { type: StringType, description: 'Code of the chapter' },
    textbookCode: { type: StringType, description: 'Code of the textBook' },
    category: { type: new NonNull(StringType), description: 'Name of the category' },
    pageNumber: { type: IntType, description: 'Page number' },
    limit: { type: IntType, description: 'Limit of the records to be fetched' },
    searchString: { type: StringType, description: 'Search string entered in the search bar.' },
  },
});

const pageInfoType = new ObjectType({
  name: 'pageInfoType',
  fields: {
    pageNumber: { type: IntType, description: 'Page number' },
    nextPage: { type: BooleanType, description: 'Is there a next Page' },
    prevPage: { type: BooleanType, description: 'Is there a previous Page' },
    recordsShown: { type: IntType, description: 'How many records are being showed in this page' },
    totalPages: { type: IntType, description: 'How many overall pages' },
    totalEntries: { type: IntType, description: 'How many overall records' },
  },
});

const TextBookType = new ObjectType({
  name: "TextBookType",
  fields:{
    code :{type: StringType},
    name :{type :StringType}
  }
})
const Count = new ObjectType({
  name :'Count',
  fields:{
    orientation:{type :IntType},
    branches:{type:IntType}
  }
})
const categoryListType = new ObjectType({
  name: 'categoryListType',
  fields: {
    id :{type: StringType ,description :'mongodb id'},
    content: { type: contentType, description: 'content json' },
    resource: { type: resourceType, description: 'resource of the file' },
    textbook :{type: TextBookType},
    topic:{type:TextBookType},
    className :{type :StringType},
    subject :{type:StringType},
    count :{type:Count},
    orientation:{type:new List(StringType)},
    branches : {type: new List(StringType)}
  },
});

export const CategoryWiseFilesOutputType = new ObjectType({
  name: 'CategoryWiseFilesOutputType',
  fields: {
    page: { type: new List(categoryListType), description: 'list of categories' },
    pageInfo: { type: pageInfoType, description: 'Info of the page which is getting displayed' },
  },
});

export const FileDataInputType = new InputType({
  name: 'FileDataInputType',
  fields: {
    // fileKey: { type: new NonNull(StringType), description: 'Key of the file' },
    // textbookCode: { type: new NonNull(StringType), description: 'code of textbook ' },
    id :{ type: new NonNull(new List(StringType)), description : 'mongodb id'}
  },
});

export const FileDataOutputType = new ObjectType({
  name: 'FileDataOutputType',
  fields: {
    id :{type : new NonNull(StringType) ,description :'mongodb id of file'},
    content: { type: contentType, description: 'content of the file' },
    resource: { type: resourceType, description: 'resource of the file' },
    publication: { type: publicationType, description: 'publisher of the file' },
    orientation: { type: new List(StringType), description: 'Orientation to which that file belongs to' },
    refs: { type: refsType, description: 'References of the file to which it belongs to' },
    branches: { type: GraphQLJSON, description: 'List of branches to which the file belongs to' },
    category: { type: StringType, description: 'Category of the file' },
    class: { type: StringType, description: 'Class to which the file belongs to' },
    subject: { type: StringType, description: 'subject to which the file belongs to' },
    textBookName: { type: StringType, description: 'Name of the textBook' },
    topicName: { type: StringType, description: 'Name of the topic' },
    coins:{type:StringType},
    filePath :{type:StringType, description:'path of the file'},
    fileSize: {type:StringType,description: 'size of the file'},
    mediaType: {type: StringType, description:'type of the file'}
  },
});

export const ContentMappingInsertionInputType = new InputType({
  name: 'ContentMappingInsertionInputType',
  fields: {
    contentCategory: { type: new NonNull(StringType), description: 'Category of content' }, // content data
    contentName: { type: new NonNull(StringType), description: 'name of the content' }, // content data
    contentType: { type: StringType, description: 'type of the content' }, // content data
    fileKey: { type: new NonNull(StringType), description: 'Key of the uploaded file' }, // Resource data
    fileSize: { type: IntType, description: 'Size of the file uploaded' }, // Resource data
    fileType: { type: new NonNull(StringType), description: 'file type' }, // Resource data
    publisher: { type: StringType, description: 'publisher of the content' }, // publisher data
    publishedYear: { type: StringType, description: 'published year' }, // publisher data
    orientation: { type: new NonNull(new List(StringType)), description: 'Orientations to which the content belongs to' },
    textBookCode: { type: new NonNull(StringType), description: 'Code of the textbook' }, // refs data
    topicCode: { type: new NonNull(StringType), description: 'Code of the textbook' }, // refs data
    branches: { type: new List(StringType), description: 'branches to which the content belongs to ' },
    category: { type: StringType, description: 'Category to which the content belongs to' },
    coins: { type: IntType, description: 'No. of Coins we get once student completes the content' },
    audioFiles: { type: new List(StringType), description: 'Array of Audio files Keys' },
  },
});

export const CmsTopicLevelStatsInputType = new InputType({
  name: 'CmsTopicLevelStatsInputType',
  fields: {
    studentId: { type: StringType, description: 'StudentId' },
    classCode: { type: StringType, description: 'Class code' },
    subjectCode: { type: StringType, description: 'subject code' },
    textbookCode: { type: StringType, description: 'Code of the textBook' },
    category: { type: new List(StringType), description: 'category' },
  },
});

export const UpdateContentInputType = new InputType({
  name: 'UpdateContentInputType',
  fields :{
    id :{type :new NonNull(StringType) , description : 'ID of the file to be edited'},
    contentName :{type : StringType , description :'name of the asset'},
    contentType :{type :StringType, description:'type of the content'},
    contentCategory : {type: StringType,description:'category of the content'},
    coins :{type : IntType , description: 'number of coins'},
    metaData: { type: GraphQLJSON, description: 'eg: thumbnailKey: "String", audioFiles: [{key :"String",name:"String"}], questionpaperId: "String"'},
    // thumbnailKey:{type: StringType ,description : 'url of the thumbnail'},
    topicCode:{type: StringType, description:'code for chapter'},
    textbookCode:{type: StringType, description:'textbook'},
  }
})

export const UpdateContentOutputType = new ObjectType({
  name:'UpdateContentOutputType',
  fields:{
    id:{type:StringType,description:'description of the filetype'},
  }
})
export const UpdateMetaDataInputType = new InputType({
  name: 'UpdateMetaDataInputType',
  fields: {
    id: { type: new NonNull(StringType), description: 'mongodb _id of the animation' },
    questionpaperId: { type: new NonNull(StringType), description: 'question paper id of the quiz' },
  },
});

export const TextbookBasedQuizInputType = new InputType({
  name: 'TextbookBasedQuizInputType',
  fields: {
    textbookCode: { type: StringType, description: 'Code of the textbook' },
  }
});

export const TextbookBasedQuizOutputType = new ObjectType({
  name: 'TextbookBasedQuizOutputType',
  fields: {
    quizName: { type: StringType, description: 'Name of the quiz' },
    questionpaperId: { type: StringType, description: 'ID of the question paper'},
  }
});

export const AssetDetailsSearchOutputType = new ObjectType({
  name: 'AssetDetailsSearchOutputType',
  fields: {
    name: { type: StringType, description: 'Name of the asset' },
    id: { type: StringType, description: 'assetId of the asset' },
    orientation: { type: new List(StringType) },
    branches: { type: new List(StringType) },
    class: { type: IntType },
    subject: { type: StringType, description: 'Name of the subject' },
    textbook: { type: StringType, description: 'Name of the textbook' },
    chapter: { type: StringType, description: 'Name of the chapter' },
  }
});

export default {
  ContentMappingType,
  CmsCategoryStatsOutputType,
  CmsCategoryStatsInputType,
  FileDataOutputType,
  FileDataInputType,
  ContentMappingInsertionInputType,
  CmsTopicLevelStatsInputType,
  UpdateContentOutputType,
  UpdateContentInputType,
  UpdateMetaDataInputType,
  TextbookBasedQuizInputType,
  TextbookBasedQuizOutputType,
  AssetDetailsSearchOutputType,
};

