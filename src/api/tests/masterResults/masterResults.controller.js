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

export async function getStudentList(req, res){
  // res.send(req.query);
  if(!req.params || !req.params.paperId){
      throw new Error('Please provide questionPaperId');
  }
  const branchName = req.user_cxt.hierarchy[0].child;
  // const branchName = [];
  if(!branchName){
      throw new Error('branchName is not available');
  }
  const orientations = req.user_cxt.orientations;
  // const orientations = [];
  // console.log(req.query.skip, req.query.limit);
  const Student = await StudentModel(req.user_cxt);
  const masterresults = await MasterResultModel(req.user_cxt);
  let query = {};
  if(branchName.length && orientations.length){
    query = {"hierarchy.child" : branchName, orientation : {$in : orientations}};
  }
  const studentInfo = await Student.aggregate([{
  $match : query},
   {$group : {_id : {studentId : "$studentId", 
   studentName : "$studentName"}}}]);
  const studentIdArray = studentInfo.map(x => x._id.studentId);
  if(!studentIdArray.length){
      console.error("No practice data is available");
  }
  // res.send(studentIdArray);
  const studentNameArray = studentInfo.map(x => x._id.studentName);
  if(studentNameArray.length !== studentIdArray.length){
      throw new Error('Data is missing');
  }
  const masterresultData = await masterresults
   .aggregate([{$match : {questionPaperId : req.params.paperId,
   studentId : {$in : studentIdArray}}} 
   ,{$sort : {"updated_at" : -1}},
   {$project : {"cwuAnalysis._id" : 0}},  
   {"$group": {"_id": "$studentId", 
   "cwuAnalysis" : {"$first" : "$cwuAnalysis"}, 
   "obtainedMarks": {"$first" : "$obtainedMarks"}}},
   {$skip : Number(req.query.skip)} ,
   {$limit : Number(req.query.limit)}]);
  // res.send(masterresultData);
  for(let i = 0; i < masterresultData.length; i += 1){
      let index = 0;
      if(studentIdArray.indexOf(masterresultData[i]._id)){
          index = studentIdArray.indexOf(masterresultData[i]._id);
          masterresultData[i].studentName = studentNameArray[index];
      }
  }
  res.send(masterresultData);
}

export default { getMasterResults, getStudentList };
