/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLInputObjectType as InputType,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { InstituteType, HierarchyType } from './institute.type';
import { config } from '../../../config/environment';

import fetch from '../../../utils/fetch';

const InstitutePatchType = new InputType({
  name: 'patchInstitute',
  fields: {
    instituteName: { type: StringType },
    establishmentYear: { type: IntType },
    academicSchedule: { type: GraphQLJSON },
    registrationId: { type: StringType },
    logoUrl: { type: StringType },
    proofOfRegistrationUrl: { type: StringType },
    proofOfRegistrationUrlFileName: { type: StringType },
  },
});

export const HierarchyPatchType = new InputType({
  name: 'HierarchyPatchType',
  fields: {
    value: { type: StringType },
  },
});

const CreateInstituteInputType = new InputType({
  name: 'CreateInstituteInputType',
  fields: {
    instituteName: { type: new NonNull(StringType) },
    establishmentYear: { type: new NonNull(IntType) },
    academicSchedule: { type: new NonNull(GraphQLJSON) },
    registrationId: { type: new NonNull(StringType) },
    logoUrl: { type: StringType },
    proofOfRegistrationUrl: { type: StringType },
    proofOfRegistrationUrlFileName: { type: StringType },
    hierarchy: { type: new NonNull(GraphQLJSON) },
  },
});

export const createInstitute = {
  args: {
    input: { type: CreateInstituteInputType },
  },
  type: new List(InstituteType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/institute/enrollInstitute`;
    const body = args.input;

    if (body.hierarchy) {
      body.hierarchy = JSON.stringify(body.hierarchy);
    }

    if (body.academicSchedule) {
      body.academicSchedule = JSON.stringify(body.academicSchedule);
    }


    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
      context,
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export const updateInstitute = {
  args: {
    patch: { type: InstitutePatchType },
  },
  type: new List(InstituteType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/institute/update/InstituteBasicDetails`;
    const body = args.patch;

    if (body.academicSchedule) {
      body.academicSchedule = JSON.stringify(body.academicSchedule);
    }

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
      context,
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

const HierarchyPatchListType = new InputType({
  name: 'HierarchyPatchListType',
  fields: {
    hierarchy: { type: new NonNull(new List(HierarchyPatchType)) },
  },
});

export const updateHierarchy = {
  args: {
    patch: {
      type: HierarchyPatchListType,
    },
  },
  type: new List(HierarchyType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/institute/update/Hierarchy`;
    const body = args.patch;

    if (body.hierarchy) {
      body.hierarchy = JSON.stringify(body.hierarchy);
    }

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
      context,
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default { createInstitute, updateInstitute, updateHierarchy };
