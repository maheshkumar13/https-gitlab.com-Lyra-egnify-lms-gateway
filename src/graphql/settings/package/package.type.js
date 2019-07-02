import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
} from 'graphql';

const PackageSubjectType = new InputType({
  name: 'PackageSubjectType',
  fields: {
    subjectCode: { type: StringType },
    textbookCodes: { type: new List(StringType) },
  },
});


const PackageSubjectType1 = new ObjectType({
  name: 'PackageSubjectType1',
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

const SubjectDetailsType = new ObjectType({
  name: 'SubjectDetailsOutputType',
  fields: {
    subjectName: { type: StringType },
    subjectCode: { type: StringType },
    textBooks: { type: new List(PackageTextbookType) },
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
    subjects: { type: new NonNull(new List(PackageSubjectType)) },
    orientations: { type: new List(StringType) },
    branches: { type: new List(StringType) },
    students: { type: new List(StringType) },
    reviewedBy: { type: StringType },
  }),
});

export const packageListOutputType = new ObjectType({
  name: 'packageListOutputType',
  fields: () => ({
    packageName: { type: new NonNull(StringType) },
    academicYear: { type: new NonNull(StringType) },
    classCode: { type: new NonNull(StringType) },
    subjects: { type: new NonNull(new List(PackageSubjectType1)) },
    orientations: { type: new List(StringType) },
    branches: { type: new List(StringType) },
    students: { type: new List(StringType) },
    reviewedBy: { type: StringType },
    date:{type:StringType},
    time:{type:StringType}
  }),
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
  CreatePackageOutputType,  
  packageListOutputType,
  PackageDetailsOutputType,
};
