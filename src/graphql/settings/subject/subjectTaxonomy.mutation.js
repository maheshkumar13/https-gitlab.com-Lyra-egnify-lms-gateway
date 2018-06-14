/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';
import { SubjectTaxonomyType } from './subjectTaxonomy.type';

export const createSubjects = {
  args: {
    data: { type: GraphQLJSON },
  },
  type: new List(SubjectTaxonomyType),
  async resolve(obj, args, context) {
    args.data = JSON.stringify(args.data);//eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/subjectTaxonomy/create/subjects`;
    return fetch(url, { method: 'POST', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' } }, context)
      .then((response) => {
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

export const removeSubjectTaxonomy = {
  args: {
    code: { type: new NonNull(StringType) },
  },
  type: SubjectTaxonomyType,
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/subjectTaxonomy/remove/`.concat(args.code);
    return fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};

export const updateSubjectTaxonomy = {
  args: {
    code: { type: new NonNull(StringType) },
    name: { type: StringType },
    subCode: { type: StringType },
  },
  type: SubjectTaxonomyType,
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/subjectTaxonomy/update/`.concat(args.code);
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        // console.log('getting is',json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};


export default {
  createSubjects,
  removeSubjectTaxonomy,
  updateSubjectTaxonomy,
};
