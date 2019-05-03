import { getModel as MasterResultModel } from '../masterResults/masterResults.model';

export async function getMasterResults(args, context) {
  args = args.input; //eslint-disable-line
  if (!args.studentId) throw new Error('StudentId is required');
  // console.log('args', args);
  const query = { studentId: args.studentId };
  if (args.questionPaperIds) {
    query.questionPaperId = {
      $in: args.questionPaperIds,
    };
  }
  const resultsObj = {};
  return MasterResultModel(context).then(MasterResult => MasterResult.find(query, {
    studentId: 1, obtainedMarks: 1, questionPaperId: 1, cwuAnalysis: 1,
  }).then((objs) => {
    if (objs && objs.length) {
      resultsObj.studentId = objs[0].studentId;
      const results = [];
      objs.forEach((obj) => {
        results.push({
          obtainedMarks: obj.obtainedMarks,
          questionPaperId: obj.questionPaperId,
          C: obj.cwuAnalysis.C,
          W: obj.cwuAnalysis.W,
          U: obj.cwuAnalysis.U,
        });
      });
      resultsObj.results = results;
      return resultsObj;
    }
    return {};
  }));
}

export default { getMasterResults };
