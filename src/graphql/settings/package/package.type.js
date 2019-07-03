import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInputObjectType as InputType,
} from 'graphql';

const PackageSubjectInputType = new InputType({
  name: 'PackageSubjectInputType',
  fields: {
    subjectCode: { type: StringType },
    textbookCodes: { type: new List(StringType) },
  },
});


const PackageSubjectOutputType = new ObjectType({
  name: 'PackageSubjectOutputType',
  fields: {
    subjectCode: { type: StringType },
    textbookCodes: { type: new List(StringType) },
  },
});

const PackageTextbookType = new ObjectType({
  name: 'PackageTextbookType',
  fields: {
    code: { type: StringType },
    name: { type: StringType },
  },
});

const ClassType = new ObjectType({
  name: 'ClassType',
  fields: {
    name: { type: StringType },
    code: { type: StringType },
  },
});  

export const CreatePackageInputType = new InputType({
  name: 'CreatePackageInputType',
  fields: () => ({
    packageName: { type: new NonNull(StringType) },
    academicYear: { type: new NonNull(StringType) },
    classCode: { type: new NonNull(StringType) },
    subjects: { type: new NonNull(new List(PackageSubjectInputType)) },
    orientations: { type: new List(StringType) },
    branches: { type: new List(StringType) },
    students: { type: new List(StringType) },
    reviewedBy: { type:new NonNull(StringType)},
  }),
});

export const PackageListOutputType = new ObjectType({
  name: 'PackageListOutputType',
  fields: () => ({
    packageName: { type: new NonNull(StringType) },
    academicYear: { type: new NonNull(StringType) },
    classCode: { type: new NonNull(StringType) },
    subjects: { type: new NonNull(new List(PackageSubjectOutputType)) },
    orientations: { type: new List(StringType) },
    branches: { type: new List(StringType) },
    students: { type: new List(StringType) },
    reviewedBy: { type: StringType },
    authoredBy: {type:StringType},
    date:{type:StringType},
    time:{type:StringType},
  }),
});

export const PackageListInputType = new InputType({
  name: 'PackageListInputType',
  fields: () => ({
    classCode : {type : StringType},
    subjectCode: { type: StringType },
    // textbookCode : {type:StringType},
    academicYear : {type: StringType},
    isAuthor : { type : BooleanType, defaultValue: false }, 
  }),
});

export const UpdatePackageInputType = new InputType({
  name: 'UpdatePackageInputType',
  fields: () => ({
    packageId : {type : new NonNull(StringType)},
    packageName: { type: (StringType) },
    academicYear: { type: (StringType) },
    subjects: { type: (new List(PackageSubjectInputType)) },
    orientations: { type: new List(StringType) },
    branches: { type: new List(StringType) },
    students: { type: new List(StringType) },
  }),
});

export const PackageFeedbackInputType = new InputType({
  name: 'PackageFeedbackInputType',
  fields: () => ({
    packageId : {type :new NonNull (StringType)},
    feedback : {type : StringType},
    status : {type : new NonNull (StringType)},
  }),
});

export const SubjectDetailsType = new ObjectType({
  name: 'SubjectDetailsType',
  fields: {
    subjectName: { type: StringType },
    subjectCode: { type: StringType },
    textBooks: { type: new List(PackageTextbookType) },
  },
});

export const CreatePackageOutputType = new ObjectType({
  name: 'CreatePackageOutputType',
  fields: () => ({
    packageName: { type: StringType },
    packageId: { type: StringType },
  }),
});

export const PackageDetailsOutputType = new ObjectType({
  name: 'PackageDetailsOutputType',
  fields: {
    packageName: { type: StringType },
    academicYear: { type: StringType },
    class: { type: ClassType }, 
    subjects: { type: new List(SubjectDetailsType) },
    orientations: { type: new List(StringType)},
    branches: { type: new List(StringType) },
    students: { type: new List(StringType) },
    reviewedBy: { type: StringType },
    authoredBy: { type: StringType },
    feedback: { type: StringType },
  },
});

export default {
  CreatePackageInputType,
  PackageListOutputType,
  PackageListInputType,
  UpdatePackageInputType,
  SubjectDetailsType,
};
