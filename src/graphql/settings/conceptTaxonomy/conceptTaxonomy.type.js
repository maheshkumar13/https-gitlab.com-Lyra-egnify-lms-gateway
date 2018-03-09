import {
  GraphQLObjectType as ObjectType,
  GraphQLStringType as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLInputObjectType as InputType,
  // GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLBoolean as BooleanType,
} from 'graphql';

// import GraphQLJSON from 'graphql-type-json';

export const TaxonomyDataType = new ObjectType({
  name: 'TaxonomyDataType',
  fields: () => ({
    level: { type: StringType },
    nextLevel: { type: StringType },
    code: { type: StringType },
    parent: { type: StringType },
    parentCode: { type: StringType },
    child: { type: StringType },
    childCode: { type: StringType },
    taxonomyTag: { type: StringType },
    next: { type: new List(TaxonomyDataType) },
  }),
});

export const ConceptTaxonomyType = new ObjectType({
  name: 'ConceptTaxonomyType',
  fields: () => ({
    level: { type: StringType },
    nextLevel: { type: StringType },
    code: { type: StringType },
    parent: { type: StringType },
    parentCode: { type: StringType },
    child: { type: StringType },
    childCode: { type: StringType },
    taxonomyTag: { type: StringType },
    next: {
      type: new List(ConceptTaxonomyType),
      async resolve(obj) {
        const filters = {};
        const url = 'http://localhost:5001/api/conceptTaxonomy/filter/nodes';
        filters.parent = obj.child;
        filters.taxonomyTag = obj.taxonomyTag;
        return fetch(url, {
          method: 'POST',
          body: JSON.stringify({ filters: JSON.stringify(filters) }),
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => response.json())
          .then(json => json)
          .catch((err) => {
            console.error(err);
          });
      },
    },
  }),
});

export const SubjectTaxonomyInputType = new InputType({
  name: 'SubjectTaxonomyInputType',
  fields: {
    code: { type: StringType },
    parent: { type: StringType },
    child: { type: StringType },
    subCode: { type: StringType },
    parentCode: { type: StringType },
  },
});

export default { TaxonomyDataType, ConceptTaxonomyType, SubjectTaxonomyInputType };
