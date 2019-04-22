/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLBoolean as BooleanType,
} from 'graphql';

// import GraphQLJSON from 'graphql-type-json';

export const HierarchyType = new ObjectType({
  name: 'HierarchyType',
  fields: {
    parent: { type: StringType },
    child: { type: StringType },
    level: { type: IntType },
    code: { type: StringType },
    noOfNodes: { type: IntType },
  },
});

const MonthType = new ObjectType({
  name: 'MonthType',
  fields: {
    month: { type: IntType },
  },
});

const AcademicScheduleType = new ObjectType({
  name: 'AcademicSchedule',
  fields: {
    start: { type: MonthType },
    end: { type: MonthType },
  },
});

export const InstituteType = new ObjectType({
  name: 'InstituteType',
  fields: {
    hierarchy: { type: new List(HierarchyType) },
    email: { type: StringType },
    phone: { type: StringType },
    instituteName: { type: StringType },
    instituteType: { type: StringType },
    ownerName: { type: StringType },
    // __subdomain: { type: StringType },
    url: { type: StringType },
    registrationStatus: { type: BooleanType },
    logoUrl: { type: StringType },
    establishmentYear: { type: IntType },
    registrationId: { type: StringType },
    instituteId: { type: StringType },
    proofOfRegistrationUrl: { type: StringType },
    proofOfRegistrationUrlFileName: { type: StringType },
    academicSchedule: { type: AcademicScheduleType },
    otpUrl: { type: StringType },
    googleTrackingId: { type: StringType },
  },
});

export default { InstituteType, HierarchyType };
