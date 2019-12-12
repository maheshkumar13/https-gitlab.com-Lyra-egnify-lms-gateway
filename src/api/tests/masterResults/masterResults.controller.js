import { getModel as MasterResultModel } from '../masterResults/masterResults.model';
import { getModel as StudentModel } from '../../settings/student/student.model';

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
    studentId: 1, obtainedMarks: 1, questionPaperId: 1, cwuAnalysis: 1, responseData: 1,
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
          responseData: obj.responseData,
        });
      });
      resultsObj.results = results;
      return resultsObj;
    }
    return {};
  }));
}

export async function getStudentList(req, res) {
  try{
  // res.send(req.user_cxt);
  if (!req.params || !req.params.paperId) {
        return res.status(404).send('Please provide questionPaperId');
  }
  const branchName = req.user_cxt.hierarchy.map(x => x.childCode);
  // const branchName = [];
  // console.log(branchName);
  const orientations = req.user_cxt.orientations;
  // const orientations = [];
  // console.log(orientations);
  let skips = 0;
  let limits = 100;
  if (Number(req.query.skip)){
    skips = Number(req.query.skip);
  }
  if (Number(req.query.limit)){
    limits = Number(req.query.limit)
  }
  const [
    Student,
    masterresults] = await Promise.all([
      StudentModel(req.user_cxt),
      MasterResultModel(req.user_cxt)
    ]);

  let query = {};
  if (branchName.length && orientations.length) {
    query = { "hierarchy.childCode": {$in : branchName}, orientation: { $in: orientations } };
  }
  const studentInfo = await Student.aggregate([{
    $match: query
  },
  {
    $group: {
      _id: {
        studentId: "$studentId",
        studentName: "$studentName"
      }
    }
  }]);
  // res.send(studentInfo);
  const studentIdArray = studentInfo.map(x => x._id.studentId);
  if (!studentIdArray.length) {
    res.status(404).send("studentId not found");
  }
  //  res.send(studentIdArray);
  const studentNameArray = studentInfo.map(x => x._id.studentName);

  const aggregationquery1 = [{
    $match: {
      questionPaperId: req.params.paperId,
      studentId: { $in: studentIdArray }
    }
  },
  { $skip: skips },
  { $limit: limits }
    , { $sort: { "updated_at": -1 } },
  { $project: { "cwuAnalysis._id": 0 } },
  {
    "$group": {
      "_id": "$studentId",
      "cwuAnalysis": { "$first": "$cwuAnalysis" },
      "obtainedMarks": { "$first": "$obtainedMarks" }
    }
  }];
  const aggregationquery2 = [{
    $match: {
      questionPaperId: req.params.paperId,
      studentId: { $in: studentIdArray }
    }
  },
  { $sort: { "updated_at": -1 } },
  {
    "$group": {
      "_id": "$studentId",
      "cwuAnalysis": { "$first": "$cwuAnalysis" },
      "obtainedMarks": { "$first": "$obtainedMarks" }
    }
  },
  { $count: 'total' }
  ]
  const [masterresultData, totalCount] = await Promise.all([
    masterresults.aggregate(aggregationquery1).allowDiskUse(true),
    masterresults.aggregate(aggregationquery2).allowDiskUse(true),
  ]);
  // res.send(totalCount);
  let masterHandlers = {};
  for (let i = 0; i < masterresultData.length; i += 1) {
    let index = 0;
    if (studentIdArray.indexOf(masterresultData[i]._id)) {
      index = studentIdArray.indexOf(masterresultData[i]._id);
      masterresultData[i].studentName = studentNameArray[index];
    }
  }
  masterHandlers.data = masterresultData;
  masterHandlers.total = totalCount;
  res.send(masterHandlers);
}
catch(err){
    return res.status(500).send('Internal server err');
}
}

export default { getMasterResults, getStudentList };
