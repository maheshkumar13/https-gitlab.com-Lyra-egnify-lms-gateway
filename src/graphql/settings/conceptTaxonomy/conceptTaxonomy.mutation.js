import {
  // GraphQLList as List
  GraphQLString as StringType,
  GraphQLInt as IntType,
} from 'graphql';
import fetch from 'universal-fetch';
import GraphQLJSON from 'graphql-type-json';

export const saveTaxonomy = {
  args: {
    url: { type: StringType },
    subjectDetails: { type: GraphQLJSON },
    level: { type: IntType },
    child: { type: StringType },
  },
  type: GraphQLJSON,
  async resolve(obj, args) {
    const body = args;
    console.error(body);

    if (body.subjectDetails) {
      body.subjectDetails = JSON.stringify(body.subjectDetails);
    }

    const url = 'http://localhost:5001/api/conceptTaxonomy/get/conceptTaxonomyfromCSV';
    return fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
    )
      .then(response => response.json())
      .then(json => json.data);
  },
};

export default { saveTaxonomy };
