/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
} from 'graphql';
import fetch from 'universal-fetch';

import InstituteHierarchyType from './instituteHierarchy.type';

export const CreateInstituteHierarchyNode = {
  args: {
    parentCode: { type: StringType },
    child: { type: StringType },
    level: { type: IntType },
    description: { type: StringType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/instituteHierarchy/create/node';

    const body = {
      parentCode: args.parentCode,
      child: args.child,
      level: args.level,
      description: args.description,
    };
    console.error(body);

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
        return [json.data];
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export const UpdateInstituteHierarchyNode = {
  args: {
    child: { type: StringType },
    childCode: { type: StringType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/instituteHierarchy/update/node/onCode';

    const body = {
      childCode: args.childCode,
      child: args.child,
    };

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

export default { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode };
