/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import fetch from 'universal-fetch';

import InstituteHierarchyType from './instituteHierarchy.type';
import { config } from '../../../config/environment';

const CreateInstituteHierarchyNodeInputType = new InputType({
  name: 'CreateInstituteHierarchyNodeInputType',
  fields: {
    parentCode: { type: new NonNull(StringType) },
    child: { type: new NonNull(StringType) },
    level: { type: new NonNull(IntType) },
    description: { type: StringType },
  },
});

export const CreateInstituteHierarchyNode = {
  args: {
    input: { type: CreateInstituteHierarchyNodeInputType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/instituteHierarchy/create/node`;

    // const body = {
    //   parentCode: args.parentCode,
    //   child: args.child,
    //   level: args.level,
    //   description: args.description,
    // };
    const body = args.input;

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then((json) => {
        console.error(json);
        return json;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

const InstituteHierarchyPatchType = new InputType({
  name: 'InstituteHierarchyPatchType',
  fields: {
    child: { type: new NonNull(StringType) },
  },
});

export const UpdateInstituteHierarchyNode = {
  args: {
    id: { type: new NonNull(StringType) },
    patch: { type: InstituteHierarchyPatchType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/instituteHierarchy/update/node/onCode`;

    const body = {
      childCode: args.id,
      child: args.patch.child,
    };

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json);
  },
};

export default { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode };
