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

import GraphQLJSON from 'graphql-type-json';

const HierarchyType = new ObjectType({
  name: 'HierarchyType',
  fields: {
    parent: { type: StringType },
    child: { type: StringType },
    level: { type: IntType },
    code: { type: StringType },
    noOfNodes: { type: IntType },
  },
});

const InstituteType = new ObjectType({
  name: 'InstituteType',
  fields: {
    hierarchy: { type: new List(HierarchyType) },
    orientationType: { type: new List(StringType) },

    email: { type: StringType },
    phone: { type: IntType },
    instituteName: { type: StringType },
    instituteType: { type: StringType },
    ownerName: { type: StringType },
    // __subdomain: { type: StringType },
    url: { type: StringType },
    acadYearDetails: { type: GraphQLJSON },
    registrationStatus: { type: BooleanType },
    gstDocFileSize: { type: IntType },
    gstDocOrginalName: { type: StringType },
    logoUrl: { type: StringType },
    gstDocUrl: { type: StringType },
    establishmentYear: { type: IntType },
    registrationId: { type: StringType },
    instituteId: { type: StringType },
    proofOfRegistrationUrl: { type: StringType },
    academicSchedule: { type: StringType },
  },
});

export default InstituteType;
