import { getModel as practiceanalysisModel } from './practiceanalysis.model';
import { getModel as PracticceSummarySchema } from './practicesummary.model';

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

export async function getPracticeCompletionStats(req, res){
    try{
        let { Branch, Orientation , Class, limit, skip } = req.query;
        let getQuery = {}
        if(Branch){
            getQuery["branch"] = Branch
        }
        if(Orientation){
            getQuery["orientation"] = Orientation
        }
        if(Class){
            getQuery["class"] = Class
        }
        limit = parseInt(limit) ? limit : 0;
        skip = parseInt(skip) ? skip : 0;
        limit = parseInt(limit)
        skip = parseInt(skip)
        const PracticeSummary = await PracticceSummarySchema(req.user_cxt);
        const [result,count] = await Promise.all([
            PracticeSummary.find(getQuery).skip(skip).limit(limit).lean(),
            PracticeSummary.count(getQuery)])
        return res.status(200).send({result,count})
    }catch(err){
        console.log(err);
        return res.status(500).send("internal server error");
    }
}

export default { getPracticeAnalysis};
