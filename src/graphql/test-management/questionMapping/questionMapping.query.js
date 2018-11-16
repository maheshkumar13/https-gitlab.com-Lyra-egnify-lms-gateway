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

function handleFetch(url, args, context) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(args),
    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
  }, context)
    .then((response) => {
      if (response.status >= 400) return new Error(response.statusText);
      return response.json().then((json) => {
        const data = { page: json };
        return data;
      });
    })
    .catch(err => new Error(err.message));
}

export const QuestionMappingsForStudentProfile = {
  args: {
    args: {
      type: new NonNull(QuestionMappingsInputType),
    },
  },
  type: QuestionMappingsType,
  async resolve(obj, { args }, context) {
    const url = `${config.services.test}/api/v1/questionMapping/student/readQuestionMapping/`;
    return handleFetch(url, args, context);
  },
};

export const QuestionMappings = {
  args: {
    args: {
      type: new NonNull(QuestionMappingsInputType),
    },
  },
  type: QuestionMappingsType,
  async resolve(obj, { args }, context) {
    const url = `${config.services.test}/api/v1/questionMapping/readQuestionMapping/`;
    return handleFetch(url, args, context);
  },
};
//   type: QuestionDetailsType,

export default{
  QuestionMappings,
  QuestionMappingsForStudentProfile,
};
