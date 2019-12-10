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
  if(!req.params || !req.params.paperId){
      throw new Error('Please provide questionPaperId');
  }
  const branchName = req.user_cxt.rawHierarchy[4].child;
  if(!branchName){
      throw new Error('branchName is not available');
  }
  const Student = await StudentModel(req.user_cxt);
  const masterresults = await MasterResultModel(req.user_cxt);
  const studentInfo = await Student.aggregate([{
  $match : {"hierarchy.child" : branchName}},
   {$group : {_id : {studentId : "$studentId", 
   studentName : "$studentName"}}}]);
  const studentIdArray = studentInfo.map(x => x._id.studentId);
  if(!studentIdArray.length){
      console.error("No practice data is available");
  }
  const studentNameArray = studentInfo.map(x => x._id.studentName);
  if(studentNameArray.length !== studentIdArray.length){
      throw new Error('Data is missing');
  }
  const masterresultData = await masterresults
   .aggregate([{$match : {questionPaperId : req.params.paperId,
   studentId : {$in : studentIdArray}}} 
   ,{$sort : {"updated_at" : -1}},  
   {"$group": {"_id": "$studentId", 
   "cwuAnalysis" : {"$first" : "$cwuAnalysis"}, 
   "obtainedMarks": {"$first" : "$obtainedMarks"}}}]);
  //res.send(masterresultData);
  for(let i = 0; i < masterresultData.length; i += 1){
      let index = 0;
      if(studentIdArray.includes(masterresultData[i]._id)){
          index = studentIdArray.indexOf(masterresultData[i]._id);
          masterresultData[i].studentName = studentNameArray[index];
      }
  }
  res.send(masterresultData);
}



export default { getMasterResults, getStudentList };