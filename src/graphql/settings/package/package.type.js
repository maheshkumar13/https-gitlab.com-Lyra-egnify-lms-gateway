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
    subject: { type: StringType },
    textbookCodes: { type: new List(StringType) },
  },
});

export const CreatePackageInputType = new InputType({
  name: 'packageInputType',
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

export const CreatePackageOutputType = new ObjectType({
  name: 'CreatePackageOutputType',
  fields: () => ({
    packageName: { type: StringType },
    packageId: { type: StringType },
  }),
});

export default {
  CreatePackageInputType,
  CreatePackageOutputType,
};
