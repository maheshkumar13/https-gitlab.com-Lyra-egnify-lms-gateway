/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aakash Parsi
   @date   18/04/2019
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLObjectType as ObjectType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
} from 'graphql';

import { ConceptTaxonomyType } from './conceptTaxonomy.type';
const controller = require('../../../api/settings/conceptTaxonomy/concpetTaxonomy.controller');

const ConceptTaxonomyFilterType = new InputType({
  name: 'ConceptTaxonomyTypeFilterType',
  fields: {
    parentCode: { type: StringType },
    childCode: { type: StringType },
    levelName: { type: StringType},
    textbookCode: { type: StringType },
  },
});

export const ConceptTaxonomy = {
  args: {
    input: { type: ConceptTaxonomyFilterType },
  },
  type: new List(ConceptTaxonomyType),
  async resolve(obj, args, context) {
    return controller.fetchNodes(args.input, context);
  }
};

export default { ConceptTaxonomy };
