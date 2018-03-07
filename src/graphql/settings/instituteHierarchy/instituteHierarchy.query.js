/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
} from 'graphql';
import fetch from 'universal-fetch';

import InstituteHierarchyType from './instituteHierarchy.type';

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
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/instituteHierarchy/get/sampleCSV';
    const body = args.input;
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
        return { csvString: json.headers };
      });
  },
};

export const InstituteHierarchy = {
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

export default { InstituteHierarchy, InstituteHierarchySample };
