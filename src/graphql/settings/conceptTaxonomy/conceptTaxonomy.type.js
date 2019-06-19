import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
} from 'graphql';

const controller = require('../../../api/settings/conceptTaxonomy/concpetTaxonomy.controller');

export const ConceptTaxonomyType = new ObjectType({
  name: 'ConceptTaxonomyType',
  fields: () => ({
    child: { type: StringType },
    childCode: { type: StringType },
    parentCode: { type: StringType },
    levelName: { type: StringType },
    code: { type: StringType },
    viewOrder:{type: StringType},
    next: {
      type: new List(ConceptTaxonomyType),
      async resolve(obj, args, context) {
        args.parentCode = obj.childCode;
        return controller.fetchNodes(args, context);
      },
    },
  }),
});


export default {
  ConceptTaxonomyType
}
