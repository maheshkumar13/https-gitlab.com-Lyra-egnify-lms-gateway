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

// import InstituteHierarchyGridType from './instituteHierarchyGrid.type';

const InstituteHierarchyGrid = {
  args: {
    pageNo: { type: IntType },
    limit: { type: IntType },
  },
  type: new List(GraphQLJSON),
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/instituteHierarchy/get/dataGrid';

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
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default InstituteHierarchyGrid;
