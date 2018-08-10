/**
   @author Parsi
   @date    12/05/2018
   @version 1.0.0
*/

import {
  GraphQLNonNull as NonNull,
  GraphQLList as List,
} from 'graphql';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

import { QuestionMappingsInputType, QuestionMappingsType } from './questionMapping.type';

export const QuestionMappings = {
  args: {
    args: {
      type: new NonNull(QuestionMappingsInputType),
    },
  },
  type: QuestionMappingsType,
  async resolve(obj, { args }, context) {
    const url = `${config.services.test}/api/v1/questionMapping/readQuestionMapping/`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .then((json) => {
        const data = { page: json }
        // console.log(data.page[0]);
        return data;
      })
      .catch(err => new Error(err.message));
  },
};
//   type: QuestionDetailsType,

export default{
  QuestionMappings,
};
