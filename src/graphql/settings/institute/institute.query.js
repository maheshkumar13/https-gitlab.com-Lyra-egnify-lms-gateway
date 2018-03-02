/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

// import { GraphQLList as List } from 'graphql';
import fetch from 'universal-fetch';

import InstituteType from './institute.type';

const Institute = {
  // args: {
  //   testId: { type: StringType },
  // },
  type: InstituteType,
  async resolve() {
    const url = 'http://localhost:5001/api/institute/getInstituteDetails';
    return fetch(url)
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default Institute;
