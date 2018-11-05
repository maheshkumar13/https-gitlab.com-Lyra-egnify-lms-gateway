
import { GraphQLNonNull as NonNull } from 'graphql';
import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';

import { QuestionPaperMetricsInputType, QuestionPaperMetricsType } from './questionPaper.type';

export const QuestionPaperMetrics = {
    args: {
    input: {
        type: new NonNull(QuestionPaperMetricsInputType),
    },
    },
    type: QuestionPaperMetricsType,
    async resolve(obj, args, context){
        const url = `${config.services.test}/api/v1/question/paperMetrics`;
        return fetch(url, {
          method: 'POST',
          body: JSON.stringify(args.input),
            headers: { 'Content-Type': 'application/json' },
        }, context)
          .then((response) => {
            if (response.status >= 400) {
              return new Error(response.statusText);
            }
            return response.json();
          })
          .then(json => json);
    },
};

export default{
    QuestionPaperMetrics,
};