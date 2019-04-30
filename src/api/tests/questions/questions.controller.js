import { getModel as QuestionModel } from './questions.model';

function getQuery(args) {
  const query = {};
  if (args.questionPaperId) query.questionPaperId = args.questionPaperId;
  return query;
}

export async function getQuestions(args, context) {
  if (!args.questionPaperId) throw new Error('questionPaperId required');
  const query = getQuery(args);
  return QuestionModel(context).then(Question => Question.find(query));
}

export async function getResults(args, context) {
  args = args.input; //eslint-disable-line
  if (!args.questionPaperId) throw new Error('questionPaperId required');
  if (!args.responses) throw new Error('responses required');
  const responses = args.responses ? args.responses : {};
  const query = getQuery(args);
  return QuestionModel(context).then(Questions => Questions.find(query, {
    key: 1, qno: 1, questionPaperId: 1, C: 1,
  }).then((questionsObj) => {
    const resultStats = {
      countOfC: 0,
      countOfU: 0,
      countOfW: 0,
      obtainedMarks: 0,
    };
    const quesKeyObject = {};
    questionsObj.forEach((qObj) => {
      quesKeyObject[qObj.qno] = {
        key: qObj.key,
        C: qObj.C,
        W: qObj.W,
        U: qObj.U,
      };
    });
    if (responses) {
      Object.keys(responses).forEach((qno) => {
        if (responses[qno].length === 0) {
          resultStats.countOfU += 1;
        } else if (responses[qno].length === quesKeyObject[qno].key.length) {
          let tempCount = 0;
          responses[qno].forEach((option) => {
            if (quesKeyObject[qno].key.includes(option)) {
              tempCount += 1;
            }
          });
          if (tempCount === quesKeyObject[qno].key.length) {
            resultStats.countOfC += 1;
            resultStats.obtainedMarks += quesKeyObject[qno].C;
          } else {
            resultStats.countOfW += 1;
          }
        } else {
          resultStats.countOfW += 1;
        }
      });
    }
    return resultStats;
  }));
}

export default { getQuestions, getResults };
