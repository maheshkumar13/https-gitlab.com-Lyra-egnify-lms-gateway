/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
import { getModel as generateAnalysisModel } from './practiceanalysis.model';
import { getModel as MasterResultModel } from '../masterResults/masterResults.model';

export async function updatePracticeAnalysis(req, res) {
    try {
        const 
        [GenerateAnalysis,
        MasterResult] =await Promise.all([
                            generateAnalysisModel(req.user_cxt),
                            MasterResultModel(req.user_cxt)]);
        const masterResultData = await MasterResult.aggregate([
            { $sort: { updated_at: -1 } }, 
            { $group: { _id: { studentId: '$studentId', 
                               questionPaperId: '$questionPaperId' }, 
                               obtainedMarks: { $first: '$obtainedMarks' }, 
                               cwuAnalysis: { $first: '$cwuAnalysis' }, 
                               updated_at: { $first: '$updated_at' } } },
           { $sort: { '_id.studentId': -1 } },
            { $project: { _id: 0, 
                          obtainedMarks: 1, 
                          questionPaperId: 1, 
                          cwuAnalysis: 1, 
               questionPaperId: '$_id.questionPaperId',
                studentId: '$_id.studentId',
           }
           }]).allowDiskUse(true);
       var bulk = GenerateAnalysis.collection.initializeUnorderedBulkOp();
     const questionPaperIdList = await MasterResult.distinct('questionPaperId');
     for (let i = 0; i < questionPaperIdList.length;i++){
                var max = -100000, min = 100000, sum = 0;
        var totalQuestion=0;
        var totalMarks=0;
        var PaperId = questionPaperIdList[i];
         var studentCounter=0;
         for(let j=0;j<masterResultData.length;j++){
             if (masterResultData[j].questionPaperId === questionPaperIdList[i]){
            totalQuestion = masterResultData[j].cwuAnalysis.C + masterResultData[j].cwuAnalysis.W + masterResultData[j].cwuAnalysis.U;
            totalMarks = totalQuestion;
                 if (masterResultData[j].obtainedMarks > max) {
                     max = masterResultData[j].obtainedMarks
                    }
                 if (masterResultData[j].obtainedMarks < min) {
                     min = masterResultData[j].obtainedMarks
                    }
                 sum = sum + masterResultData[j].obtainedMarks;
                 studentCounter=studentCounter+1;  
             }
         }
         let average = sum ? sum/studentCounter : 0
         let myobj = {
                questionPaperId: PaperId,
                totalQuestion: totalQuestion,
                totalMarks: totalMarks,
                max: max,
                min: min,
                average: average,
                totalStudent:studentCounter
            }
    bulk.find({ questionPaperId: PaperId }).upsert().update({ $set: myobj });
     }

        bulk.execute(function (err, result) {
            console.dir(err);
            console.dir(result);  
        });
        return res.status(200).send("ok");
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: "failure",
            message: "Internal Server Error !!!",
            data: ""
        });
    };
}
export default { updatePracticeAnalysis };
