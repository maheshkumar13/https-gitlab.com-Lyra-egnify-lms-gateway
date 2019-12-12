/**
 @author Nikhil Kumar
 @date    12/12/2019
*/
import { getModel as generateAnalysisModel } from './getAnalysis.model';


export async function getAnalysis(req, res) {
    try {
        const { questionPaperId } = req.params;
        //check for if questionPaperId will missing.
        if (!questionPaperId) {
            return res.status(400).json({
                status: "failure",
                message: "questionPaperId is missing !!!",
                data: ""
            });
        }

        const [GenerateAnalysis] = 
        await Promise.all([generateAnalysisModel(req.user_cxt)]);

        //Check for if questionPaperId Is present in collection or not and fetch data!!!
        const resData = await GenerateAnalysis.findOne({questionPaperId});
        if (!resData) {
            return res.status(404).json({
                status: "failure",
                message: "this is invalid question paper id !!!",
                data: ""
            });
        }
        return res.status(200).json(resData);
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: "failure",
            message: "Internal Server Error !!!",
            data: ""
        });
    };
}
export default {getAnalysis};
