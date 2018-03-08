/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';
import fetch from 'universal-fetch';

import { SubjectTaxonomyType } from '../subject/subjectTaxonomy.type';

export const Curriculum = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(SubjectTaxonomyType),
  async resolve() {
    const url = 'http://localhost:5001/api/subjectTaxonomy';
    return fetch(url, { method: 'POST' })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json.curriclumList)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default{
  Curriculum,
};
