/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';
import fetch from 'universal-fetch';

import { InstituteType } from './institute.type';
import { config } from '../../../config/environment';

const Institute = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: new List(InstituteType),
  async resolve() {
    const url = `${config.services.settings}/api/institute/getInstituteDetails`;
    return fetch(url)
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
