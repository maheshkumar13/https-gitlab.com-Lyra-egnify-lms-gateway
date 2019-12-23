/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
const cron = require('node-cron');
import { getModel as ContentMappingModel } from '../../settings/contentMapping/contentMapping.model';
import { getModel as generateAnalysisModel } from './practiceanalysis.model';
import { getModel as schedulerPracticeAnalysisModel } from './schedulerPracticeAnalysis.model';
import { getModel as MasterResultModel } from '../masterResults/masterResults.model';
const instituteId = "Egni_u001"
async function updatePracticeAnalysis() {
    try {
        
        const 
        [GenerateAnalysis,
            MasterResult, ContentMapping] =await Promise.all([
            generateAnalysisModel({ instituteId}),
            MasterResultModel({ instituteId }),
                ContentMappingModel({ instituteId })]);
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
       var bulkForContentMapping = ContentMapping.collection.initializeUnorderedBulkOp();
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
         bulkForContentMapping.find({ "resource.key": PaperId }).upsert().update({ $set: { gaStatus: true } });
     }
        const SchedulerPracticeAnalysis  = await schedulerPracticeAnalysisModel({ instituteId }); 
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const query = {
            date: date
        }
        bulk.execute(function (err, result) {
            if(err) {
                SchedulerPracticeAnalysis.update(query, { $set: { status: "failed" } }).then(res=> {
                    console.log("failed")
                });
            }
            SchedulerPracticeAnalysis.update(query, { $set: { status: "completed" } }).then(res=> {
                console.log("completed")
                bulkForContentMapping.execute(function (err, result) {
                    if (err) {
                        console.log("Failed to update content mapping gaStatus")
                    }
                    console.log("completed content Mapping")

                });
            });
        });

    } catch (err) {
        console.log(err)
    };
}

export async function scheduleforUpdatePracticeAnalysis() {
    cron.schedule('0 1 * * * *', () => {
           schedulerPracticeAnalysisModel({ instituteId }).then(SchedulerPracticeAnalysis => {
             var today = new Date();
             var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
             const query = {
                 date: date
             }   
             SchedulerPracticeAnalysis.findOne(query).then(confirmation => {
                 if (!confirmation) {
                     let Data = new SchedulerPracticeAnalysis({ 
                         date: date, 
                         trigger: true, 
                         status: "started" });
                      Data.save().then(res=>{
                          console.log("Trigger Started!!!")
                          updatePracticeAnalysis()
                          
                      });                    
                 }
             });    
         });
        
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

}
export default { updatePracticeAnalysis, scheduleforUpdatePracticeAnalysis };
