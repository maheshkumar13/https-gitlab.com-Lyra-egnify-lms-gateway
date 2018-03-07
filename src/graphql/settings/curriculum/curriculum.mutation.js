/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  // GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';
import { SubjectTaxonomyType } from '../subject/subjectTaxonomy.type';

export const createCurriculum = {
  args: {
    curriculumList: { type: GraphQLJSON },
  },
  type: new List(SubjectTaxonomyType),
  async resolve(obj, args) {
    args.curriculumList = JSON.stringify(args.curriculumList);//eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/subjectTaxonomy/create/curriculum`;
    return fetch(url, { method: 'POST', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' } })
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


export default {
  createCurriculum,
};
