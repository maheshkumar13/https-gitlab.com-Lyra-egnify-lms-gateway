import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLInt as IntType,
  GraphQLInputObjectType as InputType,
  GraphQLObjectType as ObjectType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import fetch from 'universal-fetch';
import GraphQLJSON from 'graphql-type-json';
import { config } from '../../../config/environment';

export const SubjectTaxonomyInputType = new InputType({
  name: 'SubjectTaxonomyInputType',
  fields: {
    code: { type: new NonNull(StringType) },
    child: { type: new NonNull(StringType) },
    subCode: { type: new NonNull(StringType) },
  },
});

const GenerateTaxonomyInputType = new InputType({
  name: 'GenerateTaxonomyInputType',
  fields: {
    subjectDetails: { type: SubjectTaxonomyInputType },
    level: { type: new NonNull(IntType) },
    child: { type: new NonNull(StringType) },
    url: { type: new NonNull(StringType) },
  },
});

const ConceptTaxonomyInputType = new InputType({
  name: 'ConceptTaxonomyInputType',
  fields: {
    subjectDetails: { type: SubjectTaxonomyInputType },
    level: { type: new NonNull(IntType) },
    child: { type: new NonNull(StringType) },
  },
});

export const GenerateConceptTaxonomy = {
  args: {
    input: { type: GenerateTaxonomyInputType },
  },
  type: GraphQLJSON,
  async resolve(obj, args) {
    const body = args.input;
    console.error(body);

    if (body.subjectDetails) {
      body.subjectDetails = JSON.stringify(body.subjectDetails);
    }

    const url = `${config.services.settings}/api/conceptTaxonomy/get/conceptTaxonomyfromCSV`;
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
      .then(json => json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};

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
        const url = `${config.services.settings}/api/conceptTaxonomy/get/taxonomy`;
        return fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            taxonomyTag: obj.taxonomyTag,
          }),
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => response.json())
          .then((json) => {
            console.error(json);
            return json;
          });
      },
    },
  }),
});


export const conceptTaxonomy = {
  args: {
    input: { type: ConceptTaxonomyInputType },
  },
  type: new List(ConceptTaxonomyType),
  async resolve(obj, args) {
    const body = args.input;

    if (body.subjectDetails) {
      body.subjectCode = body.subjectDetails.code;
    }

    const url = `${config.services.settings}/api/conceptTaxonomy/get/taxonomy`;
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

export default { GenerateConceptTaxonomy };
