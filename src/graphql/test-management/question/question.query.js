/**
   @author KSSR
   @date    12/05/2018
   @version 1.0.0
*/

import { GraphQLNonNull as NonNull } from 'graphql';
import fetch from 'universal-fetch';
import { config } from '../../../config/environment';

import { QuestionDetailsInputType, QuestionDetailsType } from './question.type';


export const QuestionDetails = {
  args: {
    args: {
      type: new NonNull(QuestionDetailsInputType),
    },
  },
  type: QuestionDetailsType,
  async resolve(obj, { args }) {
    const url = `${config.services.test}/api/v1/questionDetails`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
	    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    })
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

export default{
  QuestionDetails,
};
