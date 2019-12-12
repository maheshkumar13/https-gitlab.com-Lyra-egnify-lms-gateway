/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
import { getModel as generateAnalysisModel } from './practiceanalysis.model';
import { getModel as MasterResultModel } from '../masterResults/masterResults.model';

export async function updatePracticeAnalysis(req, res) {
    try {
        const [GenerateAnalysis,MasterResult] =
            await Promise.all(
                [generateAnalysisModel(req.user_cxt),
                    MasterResultModel(req.user_cxt)]);
      //  const db_name = db.db(dbName);
        // let query = {
        //     questionPaperId: "QP0088"
        // }
        // db_name.collection(collection1).find(query,
        //     { projection: { "obtainedMarks": 1, questionPaperId: 1, cwuAnalysis: 1 } })
        //     .toArray((err, res) => {
        //         console.log("res", res);
        //         // console.log("res", res.length);
        //         let max = -100000, min = 100000, average = 0;
        //         let totalQuestion = res[0].cwuAnalysis.C + res[0].cwuAnalysis.W + res[0].cwuAnalysis.U;
        //         let totalMarks = res[0].cwuAnalysis.C + res[0].cwuAnalysis.W + res[0].cwuAnalysis.U;
        //         let questionPaperId = res[0].questionPaperId;
        //         // console.log(totalQuestion)
        //         // console.log(questionPaperId)
        //         res.forEach(result => {
        //             if (result.obtainedMarks > max) {
        //                 max = result.obtainedMarks
        //             }
        //             if (result.obtainedMarks < min) {
        //                 min = result.obtainedMarks
        //             }
        //             average = average + result.obtainedMarks;
        //         });
        //         let myobj = {
        //             questionPaperId: questionPaperId,
        //             totalQuestion: totalQuestion,
        //             totalMarks: totalMarks,
        //             max: max,
        //             min: min,
        //             average: average / res.length
        //         }

        //         db_name.collection("generateAnalysis").update({ questionPaperId: questionPaperId }, myobj, { upsert: true }, function (err, res) {
        //             if (err) throw err;
        //             console.log("1 document inserted");
        //             db.close();
        //         });
        //     });
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
