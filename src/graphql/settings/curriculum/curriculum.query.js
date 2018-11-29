/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';
import { config } from '../../../config/environment';
import { SubjectTaxonomyType } from '../subject/subjectTaxonomy.type';

import fetch from '../../../utils/fetch';

export const Curriculum = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(SubjectTaxonomyType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/subjectTaxonomy`;
    return fetch(url, { method: 'POST' }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json().then(json => json.curriclumList);
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default{
  Curriculum,
};
