import { getModel as practiceanalysisModel } from './practiceanalysis.model';
import { getModel as StudentInfoSchema } from '../../settings/student/student.model';
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

export async function getStudentWisePracticeStats(req, res){
    try{
        let { Branch, Class, Orientation, Section, limit, skip} = req.query;
        limit = parseInt(limit) ? limit : 0;
        skip = parseInt(skip) ? skip : 0;
        limit = parseInt(limit)
        skip = parseInt(skip)
        if( !Branch || !Class || !Orientation){
            return res.status(400).send("Bad Req.")
        }
        let aggregateQuery = [
            {
                "$lookup":{
                    "from": "masterresults",
                    "let": { studentId: "$studentId"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr":{
                                    "$eq": ["$studentId", "$$studentId"]
                                }
                            }
                        },
                        {
                            "$group":{
                                "_id": {
                                    "studentId": "$studentId",
                                    "questionPaperId": "$questionPaperId"
                                }
                            }
                        }
                    ],		
                    "as": "practiceInfo"
                }
            },{
                "$project":{
                    "studentId": 1,
                    "class": "$hierarchyLevels.L_2",
                    "branch": "$hierarchyLevels.L_5",
                    "orientation": 1,
                    "section": "$hierarchyLevels.L_6",
                    "attemptedPractice": {
                        $cond: {
                            if: {
                                $isArray: "$practiceInfo"
                            },
                            then: {
                                $size: "$practiceInfo"
                            },
                            else: 0
                        }
                    },
                    studentName: 1,
                    _id: 0
                }
            }
        ];
        let matchQuery = {
            "$match":{
                "orientation": Orientation,
                "hierarchyLevels.L_5": Branch,
                "hierarchyLevels.L_2": Class
            }
        }
        if(Section){
            matchQuery["$match"]["hierarchyLevels.L_6"] = Section; 
        }
        aggregateQuery.splice(0,0,matchQuery);
        aggregateQuery.splice(1,0,{$skip: skip})
        if(limit){
            aggregateQuery.splice(2,0,{$limit: limit});
        }

        const StudentInfo = await StudentInfoSchema(req.user_cxt);
        let [results,count] = await Promise.all([
            StudentInfo.aggregate(aggregateQuery).allowDiskUse(true),
            StudentInfo.count(matchQuery["$match"])
        ]);
        return res.status(200).send({ results, count});        
    }catch(err){
        console.log(err);
        return res.status(500).send("internal server error");
    }
}

export default { getPracticeAnalysis};
