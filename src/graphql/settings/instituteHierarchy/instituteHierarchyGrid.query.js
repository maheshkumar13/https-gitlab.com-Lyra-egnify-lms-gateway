/**
   @author  Bharath Vemula
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLInt as IntType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';

// import InstituteHierarchyGridType from './instituteHierarchyGrid.type';

const InstituteHierarchyGrid = {
  args: {
    pageNo: { type: IntType },
    limit: { type: IntType },
  },
  type: new List(GraphQLJSON),
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/instituteHierarchy/get/dataGrid`;

    let limit = 1000;
    if (args.limit) limit = args.limit; // eslint-disable-line

    const pagination = {
      pageNo: args.pageNo,
      limit,
    };
    console.error(pagination);

    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify({ pagination: JSON.stringify(pagination) }),
        headers: { 'Content-Type': 'application/json' },
      },
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

export default InstituteHierarchyGrid;
