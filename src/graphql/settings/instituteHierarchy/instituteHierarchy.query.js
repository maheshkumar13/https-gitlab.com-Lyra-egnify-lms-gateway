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

const InstituteHierarchy = {
  args: {
    parentCode: { type: StringType },
    childCode: { type: StringType },
    level: { type: IntType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args) {
    const filters = {};
    const url = 'http://localhost:5001/api/instituteHierarchy/filter/nodes';

    let filterStatus = false;
    if (args.level) {
      filters.level = args.level;
      filterStatus = true;
    }

    if (args.parentCode) {
      filters.parentCode = args.parentCode;
      filterStatus = true;
    }

    if (args.childCode) {
      filters.childCode = args.childCode;
      filterStatus = true;
    }

    if (!filterStatus) {
      filters.level = 1;
    }

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify({ filters: JSON.stringify(filters) }),
        headers: { 'Content-Type': 'application/json' },
      },
    )
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default InstituteHierarchy;
