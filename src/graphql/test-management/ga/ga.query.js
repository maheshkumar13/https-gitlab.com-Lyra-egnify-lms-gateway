/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLList as List,
} from 'graphql';
import fetch from 'universal-fetch';

import { CommonAnalysisType } from './ga.type';

import { config } from '../../../config/environment';

// const CommonAnalysis = {
//   args: {
//     testId: { type: StringType },
//   },
//   type: new List(CommonAnalysisType),
//   async resolve(obj, args) {
//     const gaBody = JSON.stringify(args);//eslint-disable-line
//
//     const url = 'https://egnify-product.appspot.com/api/v1/masterResult/read';
//     return fetch(url, { method: 'POST', body: gaBody, headers: { 'Content-Type': 'application/json' } })
//       .then((response) => {
//         if (response.status >= 400) {
//           return new Error(response.statusText);
//         }
//         return response.json();
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   },
// };

export const CommonAnalysis = {
  args: {
    testId: { type: StringType },
  },
  type: new List(CommonAnalysisType),
  async resolve(obj, args) {
    const url = 'https://egnify-product.appspot.com/api/v1/masterResult/read';
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
      .then(response => response.json())
      .catch(err => new Error(err.message));
  },
};

export default CommonAnalysis;
