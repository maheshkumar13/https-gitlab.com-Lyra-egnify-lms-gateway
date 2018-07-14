/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';
import { SubjectTaxonomyType, SubjectType } from './subjectTaxonomy.type';

export const SubjectList = {
  args: {
    code: { type: new NonNull(StringType) },
  },
  type: new List(SubjectType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/subjectTaxonomy/curriculum/`.concat(args.code);
    return fetch(url, { method: 'POST' }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json =>
        json.subjectList)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const SubjectTaxonomy = {
  args: {
    code: { type: new NonNull(StringType) },
  },
  type: SubjectTaxonomyType,
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/subjectTaxonomy/read/`.concat(args.code);
    return fetch(url, { method: 'POST' }, context)
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

export default{
  SubjectList,
  SubjectTaxonomy,
};
