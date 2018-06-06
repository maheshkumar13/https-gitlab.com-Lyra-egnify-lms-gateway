/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLList as List,
} from 'graphql';

import { GradeType } from './grade.type';

import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';


const GradeSystem = {
  args: {
    _id: { type: StringType },
  },
  type: new List(GradeType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/grade/read/system/`;
    return fetch(url, { method: 'POST' }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default GradeSystem;
