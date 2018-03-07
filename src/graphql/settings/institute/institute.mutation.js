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
import fetch from 'universal-fetch';
import GraphQLJSON from 'graphql-type-json';
import { InstituteType, HierarchyType } from './institute.type';


const InstitutePatchType = new InputType({
  name: 'patchInstitute',
  fields: {
    instituteName: { type: StringType },
    establishmentYear: { type: IntType },
    academicSchedule: { type: GraphQLJSON },
    registrationId: { type: StringType },
    logoUrl: { type: StringType },
    proofOfRegistrationUrl: { type: StringType },
  },
});

export const HierarchyPatchType = new InputType({
  name: 'HierarchyPatchType',
  fields: {
    parent: { type: StringType },
    child: { type: StringType },
    level: { type: IntType },
    code: { type: StringType },
    noOfNodes: { type: IntType },
  },
});

export const createInstitute = {
  args: {
    instituteName: { type: new NonNull(StringType) },
    establishmentYear: { type: new NonNull(IntType) },
    academicSchedule: { type: new NonNull(GraphQLJSON) },
    registrationId: { type: new NonNull(StringType) },
    logoUrl: { type: StringType },
    proofOfRegistrationUrl: { type: StringType },
    hierarchy: { type: new NonNull(GraphQLJSON) },
  },
  type: new List(InstituteType),
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/institute/enrollInstitute';
    const body = args;

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
    )
      .then(response => response.json())
      .then((json) => {
        console.error(json);
        return json.data;
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
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/institute/update/InstituteBasicDetails';
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
    )
      .then(response => response.json())
      .then((json) => {
        console.error(json);
        return json.data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};


export const updateHierarchy = {
  args: {
    patch: { type: new NonNull(new List(HierarchyPatchType)) },
  },
  type: new List(HierarchyType),
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/institute/update/Hierarchy';
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
    )
      .then(response => response.json())
      .then((json) => {
        console.error(json);
        return json.data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default { createInstitute, updateInstitute };
