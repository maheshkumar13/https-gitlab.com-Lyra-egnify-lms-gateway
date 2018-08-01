/**
   @author  Bharath Vemula
   @date
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
  GraphQLBoolean as BooleanType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';

// import InstituteHierarchyGridType from './instituteHierarchyGrid.type';

const pageInfoType = new ObjectType({
  name: 'InstituteHierarchypageInfoType',
  fields() {
    return {
      pageNumber: {
        type: IntType,
      },
      nextPage: {
        type: BooleanType,
      },
      prevPage: {
        type: BooleanType,
      },
      totalPages: {
        type: IntType,
      },
      totalEntries: {
        type: IntType,
      },
    };
  },
});

const InstituteHierarchyGridType = new ObjectType({
  name: 'InstituteHierarchyGridType',
  fields() {
    return {
      data: {
        type: GraphQLJSON,
      },
      pageInfo: {
        type: pageInfoType,
      },
    };
  },
});

const FilterInputType = new InputType({
  name: 'FilterInputType',
  fields: {
    level: { type: IntType },
    data: { type: new List(StringType) },
  },
});

const TableFiltersInputType = new InputType({
  name: 'TableFiltersInputType',
  fields: {
    tableFilters: { type: new List(FilterInputType) },
  },
});

const InstituteHierarchyGridInputType = new InputType({
  name: 'InstituteHierarchyGridInputType',
  fields: {
    filters: { type: TableFiltersInputType },
  },
});

const LevelFiltersInputType = new InputType({
  name: 'LevelFiltersInputType',
  fields: {
    level: { type: new NonNull(IntType) },
  },
});

// Endpoint to fetch filters on a level.
export const LevelFilters = {
  args: {
    input: { type: LevelFiltersInputType },
  },
  type: new List(StringType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/instituteHierarchy/get/filtersOnALevel`;
    const body = args.input;

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify({ level: body.level }),
        headers: { 'Content-Type': 'application/json' },
      },
      context,
    )
      .then(response => response.json())
      .then(json => json.data);
  },
};

// Endpoint to fetch institute Hierarchy Table.
export const InstituteHierarchyGrid = {
  args: {
    pageNumber: { type: NonNull(IntType) },
    limit: { type: NonNull(IntType) },
    sortBy: { type: StringType },
    order: { type: IntType },
    input: { type: InstituteHierarchyGridInputType },
    regex: { type: StringType },
  },
  type: InstituteHierarchyGridType,
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/instituteHierarchy/get/dataGrid`;

    let limit = 1000;
    if (args.limit) limit = args.limit; // eslint-disable-line

    const inputArgs = args.input;
    let filters = [];
    if (inputArgs) {
      if (inputArgs.filters) {
      filters = inputArgs.filters; // eslint-disable-line
      }
    }

    const pagination = {
      pageNumber: args.pageNumber,
      limit,
    };

    if (args.regex !== undefined) {
      args.regex = args.regex.replace(/\s\s+/g, ' ').trim(); //eslint-disable-line
      if (args.regex === '') {
        args.regex = undefined; //eslint-disable-line
      }
    }

    return fetch(
      url,
      {
        method: 'POST',
        body:
        JSON.stringify({
          pagination: JSON.stringify(pagination),
          filters: JSON.stringify(filters),
          sortBy: args.sortBy,
          order: args.order,
          regex: args.regex,
        }),
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
      .then((json) => {
        if (json.data) {
          const pageInfo = {};
          const resp = {};
          pageInfo.prevPage = true;
          pageInfo.nextPage = true;
          pageInfo.pageNumber = args.pageNumber;
          pageInfo.totalPages = Math.ceil(json.count / args.limit)
            ? Math.ceil(json.count / args.limit)
            : 1;
          pageInfo.totalEntries = json.count;
          resp.data = json.data;

          if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
            throw new Error('Page Number is invalid');
          }

          if (args.pageNumber === pageInfo.totalPages) {
            pageInfo.nextPage = false;
          }
          if (args.pageNumber === 1) {
            pageInfo.prevPage = false;
          }

          resp.pageInfo = pageInfo;
          return resp;
        }
        return json;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default { InstituteHierarchyGrid, LevelFilters };
