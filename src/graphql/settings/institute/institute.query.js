/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';

import { InstituteType } from './institute.type';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';


const Institute = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(InstituteType),
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/institute/getInstituteDetails`;
    return fetch(url, { method: 'POST' }, context)
      .then(response => response.json())
      .then((json) => {
        console.error(json);
        return json;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};

export default Institute;
