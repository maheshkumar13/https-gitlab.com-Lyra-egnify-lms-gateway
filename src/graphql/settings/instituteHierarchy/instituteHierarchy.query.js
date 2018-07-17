/**
   @description GraphQl queries for Institute Hierarchy.

   @author Bharath Vemula
   @date   14/03/2018
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
} from 'graphql';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

import InstituteHierarchyType from './instituteHierarchy.type';

const InstituteHierarchyFilterType = new InputType({
  name: 'InstituteHierarchyFilterType',
  fields: {
    parentCode: { type: StringType },
    childCode: { type: StringType },
    level: { type: IntType },
    ancestorCode: { type: StringType },
  },
});

const sampleInstituteHierarchyType = new ObjectType({
  name: 'downloadInstituteBasicDetailsSample',
  fields: {
    csvString: { type: StringType },
  },
});

const downloadSampleInputType = new InputType({
  name: 'downloadSampleInputType',
  fields: {
    level: { type: IntType },
  },
});

export const InstituteHierarchySample = {
  args: {
    input: { type: downloadSampleInputType },
  },
  type: sampleInstituteHierarchyType,
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/instituteHierarchy/get/sampleCSV`;
    const body = args.input;
    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
      context,
    )
      .then(response => response.json())
      .then((json) => {
      
        return { csvString: json.headers };
      });
  },
};

export const InstituteHierarchy = {
  args: {
    input: { type: InstituteHierarchyFilterType },
  },
  type: new List(InstituteHierarchyType),
  async resolve(obj, args, context) {
    const filters = {};
    const url = `${config.services.settings}/api/instituteHierarchy/filter/nodes`;
    args = args.input; // eslint-disable-line

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

    if (args.ancestorCode) {
      filters.ancestorCode = args.ancestorCode;
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
      context,
    )
      .then(async (response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default { InstituteHierarchy, InstituteHierarchySample };
