/**
   @author KSSR
   @date    12/05/2018
   @version 1.0.0
*/

import { GraphQLNonNull as NonNull, GraphQLString as StringType, GraphQLList as List } from 'graphql';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

import { QuestionMappingDetailsType, QuestionMappingDetailsInputType, GetQuestionsInputType, GetQuestionsType, QuestionDetailsInputType, QuestionDetailsType } from './question.type';

export const QuestionMappingDetails = {
  args: {
    args: { type: QuestionMappingDetailsInputType },
  },
  type: new List(QuestionMappingDetailsType),
  async resolve(obj, { args }, context) {
    const url = `${config.services.test}/api/v1/questionMapping/readQuestionMapping`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .then(json => json)
      .catch(err => new Error(err.message));
  },
};
export const QuestionDetails = {
  args: {
    args: {
      type: new NonNull(QuestionDetailsInputType),
    },
  },
  type: QuestionDetailsType,
  async resolve(obj, { args }, context) {
    const url = `${config.services.test}/api/v1/questionDetails`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then(response => response.json())
      .then((json) => {
        const data = {};
        data.page = json.questionDetails;
        const pageInfo = {};
        pageInfo.prevPage = true;
        pageInfo.nextPage = true;
        pageInfo.pageNumber = args.pageNumber;
        pageInfo.totalPages = Math.ceil(json.count / args.limit)
          ? Math.ceil(json.count / args.limit)
          : 1;
        pageInfo.totalEntries = json.count;

        if (args.pageNumber < 1 || args.pageNumber > pageInfo.totalPages) {
          return new Error('Page Number is invalid');
        }

        if (args.pageNumber === pageInfo.totalPages || !args.pageNumber) {
          pageInfo.nextPage = false;
        }
        if (args.pageNumber === 1 || !args.pageNumber) {
          pageInfo.prevPage = false;
        }
        if (pageInfo.totalEntries === 0) {
          pageInfo.totalPages = 0;
        }
        data.pageInfo = pageInfo;
        return data;
      })
      .catch(err => new Error(err.message));
  },
};

export const GetQuestions = {
  args: {
    input: { type: new NonNull(GetQuestionsInputType) },
  },
  type: GetQuestionsType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/question/getQuestions`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
      headers: { 'Content-Type': 'application/json' },
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        // console.log("REsponse:",response.json());
        return response.json();
      })
      .then(json =>
        // console.log("Json:", json);
        json);
  },
};

export default{
  QuestionDetails,
  GetQuestions,
};
