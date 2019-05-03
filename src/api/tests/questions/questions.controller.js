import { getModel as QuestionModel } from './questions.model';
import { getModel as MasterResultModel } from '../masterResults/masterResults.model';

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

async function prepareDataForMasterResults(args, resultStats, evaluation, context) {
  const {
    studentId, questionPaperId, responses,
  } = args;
  const whereObj = { studentId, questionPaperId };
  const responseData = {
    evaluation: evaluation.evaluatedResponse,
    score: evaluation.evaluatedScore,
    response: responses,
  };
  const cwuAnalysis = {
    C: resultStats.countOfC,
    W: resultStats.countOfW,
    U: resultStats.countOfU,
  };
  const refs = {
    questionPaperId,
  };
  const setObj = {
    studentId,
    responseData,
    cwuAnalysis,
    refs,
    obtainedMarks: resultStats.obtainedMarks,
  };
  await MasterResultModel(context).then(masterResults =>
    masterResults.updateOne(whereObj, { $set: setObj }, { upsert: true }, (err) => {
      if (err) {
        return err;
      }
      return 'Inserted Successfully';
    }));
}

export async function getAndSaveResults(args, context) {
  args = args.input; //eslint-disable-line
  if (!args.questionPaperId) throw new Error('questionPaperId is required');
  if (!args.responses) throw new Error('responses array is required');
  const responses = args.responses ? args.responses : {};
  const query = getQuery(args);
  return QuestionModel(context).then(Questions => Questions.find(query, {
    key: 1, qno: 1, questionPaperId: 1, C: 1, W: 1, U: 1,
  }).then((questionsObj) => {
    const resultStats = {
      countOfC: 0,
      countOfU: 0,
      countOfW: 0,
      obtainedMarks: 0,
    };
    const evaluation = { evaluatedResponse: {}, evaluatedScore: {} };
    const quesKeyObject = {};
    questionsObj.forEach((qObj) => {
      const keyArray = [];
      qObj.key.forEach((keyValue) => {
        keyArray.push(keyValue.toLowerCase());
      });
      quesKeyObject[qObj.qno] = {
        key: keyArray,
        C: qObj.C,
        W: qObj.W,
        U: qObj.U,
      };
    });
    if (responses) {
      Object.keys(responses).forEach((qno) => {
        // console.log('quesKeyObject[qno]', quesKeyObject[qno]);
        if (responses[qno].length === 0) {
          evaluation.evaluatedResponse[qno] = 'U';
          evaluation.evaluatedScore[qno] = quesKeyObject[qno].U;
          resultStats.countOfU += 1;
        } else if (responses[qno].length === quesKeyObject[qno].key.length) {
          let tempCount = 0;
          responses[qno].forEach((option) => {
            if (quesKeyObject[qno].key.includes(option.toLowerCase())) {
              console.info(quesKeyObject[qno].key);
              console.info(option.toLowerCase());
              tempCount += 1;
            }
          });
          if (tempCount === quesKeyObject[qno].key.length) {
            resultStats.countOfC += 1;
            evaluation.evaluatedResponse[qno] = 'C';
            evaluation.evaluatedScore[qno] = quesKeyObject[qno].C;
            resultStats.obtainedMarks += quesKeyObject[qno].C;
          } else {
            evaluation.evaluatedResponse[qno] = 'W';
            evaluation.evaluatedScore[qno] = quesKeyObject[qno].W;
            resultStats.countOfW += 1;
          }
        } else {
          evaluation.evaluatedResponse[qno] = 'W';
          evaluation.evaluatedScore[qno] = quesKeyObject[qno].W;
          resultStats.countOfW += 1;
        }
      });
    }
    prepareDataForMasterResults(args, resultStats, evaluation, context);
    return resultStats;
  }));
}

export default { getQuestions, getAndSaveResults };
