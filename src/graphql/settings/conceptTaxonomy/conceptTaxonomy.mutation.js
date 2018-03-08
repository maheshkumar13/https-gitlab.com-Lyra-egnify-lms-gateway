import {
  // GraphQLList as List
  GraphQLString as StringType,
  GraphQLInputObjectType as InputType,
  GraphQLInt as IntType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import fetch from 'universal-fetch';
import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';
import { SubjectTaxonomyInputType } from './conceptTaxonomy.query';

const SaveTaxonomyInputType = new InputType({
  name: 'SaveTaxonomyInputType',
  fields: {
    conceptData: { type: NonNull(GraphQLJSON) },
    subjectDetails: { type: NonNull(SubjectTaxonomyInputType) },
    level: { type: NonNull(IntType) },
    child: { type: NonNull(StringType) },
  },
});

export const saveTaxonomy = {
  args: {
    input: { type: SaveTaxonomyInputType },
  },
  type: GraphQLJSON,
  async resolve(obj, args) {
    const body = args.input;
    console.error(body);

    if (body.subjectDetails) {
      body.subjectDetails = JSON.stringify(body.subjectDetails);
    }

    if (body.conceptData) {
      body.conceptData = JSON.stringify(body.conceptData);
    }

    const url = `${config.services.settings}/api/conceptTaxonomy/save/taxonomy`;
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

export default { saveTaxonomy };
