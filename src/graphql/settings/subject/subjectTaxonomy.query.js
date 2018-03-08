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
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';
import { SubjectTaxonomyType, SubjectType } from './subjectTaxonomy.type';

export const SubjectList = {
  args: {
    code: { type: new NonNull(StringType) },
  },
  type: new List(SubjectType),
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/subjectTaxonomy/curriculum/`.concat(args.code);
    return fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then(json =>
        // console.log('json is',json)
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
  async resolve(obj, args) {
    const url = `${config.services.settings}/api/subjectTaxonomy/read/`.concat(args.code);
    return fetch(url, { method: 'GET' })
      .then(response => response.json())
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
