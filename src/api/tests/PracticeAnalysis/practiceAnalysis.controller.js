
import { getModel as practiceanalysisModel } from './practiceanalysis.model';


export async function getPracticeAnalysis(req, res) {
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
        const PracticeAnalysis = await practiceanalysisModel(req.user_cxt);
        //Check for if questionPaperId Is present in collection or not and fetch data!!!
        const resData = await PracticeAnalysis.findOne({questionPaperId});
        if (!resData) {
            return res.status(204).json({
                status: "failure",
                message: "this is invalid question paper id !!!",
                data:[]
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
export default { getPracticeAnalysis};
