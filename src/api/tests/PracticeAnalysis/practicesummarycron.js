const cron = require('node-cron');
import { getModel as TextbookSchema } from '../../settings/textbook/textbook.model';
import { getModel as MasterResultSchema }from '../masterResults/masterResults.model';
import { getModel as PracticeSummarySchema } from './practicesummary.model';
import { getModel as StudentInfoModel } from '../../settings/student/student.model';
const instituteId = "Egni_u001"

export async function practiceSummary() {
    cron.schedule('0 0 2 * * *', async () => {
        try{
            console.log("Practice summary cron started.")
            const Textbook = await TextbookSchema({instituteId});
            const MasterResults = await MasterResultSchema({instituteId});
            const PracticeSummaryModel = await PracticeSummarySchema({instituteId});
            const StudentInfo = await StudentInfoModel({instituteId});

            const aggregateQueryForContentMappings = [
                {
                    "$match": {
                        "active": true
                    }
                },
                {
                    "$lookup": {
                        "from": "contentmappings",
                        "let": {
                            "code": "$code"
                        },
                        "pipeline": [{
                            "$match": {
                                "active": true,
                                "gaStatus": true,
                                "content.category": "Practice",
                                "$expr": {"$eq": ["$refs.textbook.code", "$$code"]}
                                }
                        }],
                        "as": "practices"
                    }
                },
                {
                    "$project": {
                        "orientation": "$orientations",
                        "branch": "$branches",
                        "class": "$refs.class.name",
                        "numberOfPractices": {
                            "$cond": {
                                "if": {
                                    "$isArray": "$practices"
                                },
                                "then": {
                                    "$size": "$practices"
                                },
                                "else": 0
                            }
                        }
                    }
                },
                {
                    "$unwind": "$orientation"
                },
                {
                    "$unwind": "$branch"
                },
                {
                    $group: {
                           _id: {
                               orientation: "$orientation",
                               branch: "$branch",
                               class: "$class"
                           },
                           numberOfPractices: {$sum: "$numberOfPractices"}
                    }
                },
                {
                    "$project": {
                        "orientation": "$_id.orientation",
                        "branch": "$_id.branch",
                        "class": "$_id.class",
                        "numberOfPractices": 1,
                        _id: 0
                    }
                }
            ]

            const aggregateQueryForStudentInfo = [{
                $match: {
                    active: true
                }
            }, {
                $group: {
                    _id: {
                        class: "$hierarchyLevels.L_2",
                        branch: "$hierarchyLevels.L_5",
                        orientation: "$orientation"
                    },
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $project: {
                    class: "$_id.class",
                    branch: "$_id.branch",
                    orientation: "$_id.orientation",
                    _id: 0,
                    numberOfStudents: "$count"
                }
            }]
            
            const aggregateQueryForMasterResults = [
                {
                    "$group": {
                        "_id": "$studentId"
                    }
                },{
                    "$lookup": {
                        "from": "studentInfo",
                        "localField": "_id",
                        "foreignField": "studentId",
                        "as": "studentInfo"
                    }
                },
                { "$unwind": "$studentInfo" },
                {
                    "$group": {
                        "_id": {
                            "class": "$studentInfo.hierarchyLevels.L_2",
                            "branch": "$studentInfo.hierarchyLevels.L_5",
                            "orientation": "$studentInfo.orientation"
                        },
                        "count": {"$sum": 1}
                    }
                },{
                    "$project":{
                        "class": "$_id.class",
                        "branch": "$_id.branch",
                        "orientation": "$_id.orientation",
                        "noOfStudentAttemptedPractice": "$count",
                        "_id": 0
                    }
                }
            ]

            let aggregatedDataFromContentMappings = await Textbook.aggregate(aggregateQueryForContentMappings).allowDiskUse(true);
            let aggregatedDataFromMasterResults = await MasterResults.aggregate(aggregateQueryForMasterResults).allowDiskUse(true);
            let aggregatedDataFromStudentInfo = await StudentInfo.aggregate(aggregateQueryForStudentInfo).allowDiskUse(true);
            const lengthAggregatedDataFromContentMappings = aggregatedDataFromContentMappings.length;
            const lengthAggregatedDataFromMasterResults = aggregatedDataFromMasterResults.length;
            const lengthAggregatedDataFromStudentInfo = aggregatedDataFromStudentInfo.length;
            let indexed_aggregatedDataFromMasterResults = {};
            let indexed_aggregatedDataFromStudentInfo = {};
            for (let i = 0 ; i < lengthAggregatedDataFromMasterResults ; i++){
                let key = aggregatedDataFromMasterResults[i]["class"] + 
                aggregatedDataFromMasterResults[i]["branch"] + aggregatedDataFromMasterResults[i]["orientation"];
                indexed_aggregatedDataFromMasterResults[key] = aggregatedDataFromMasterResults[i]["noOfStudentAttemptedPractice"];
            }
            for(let i = 0; i < lengthAggregatedDataFromStudentInfo; i++ ){
                let key = aggregatedDataFromStudentInfo[i]["class"] + 
                aggregatedDataFromStudentInfo[i]["branch"] + aggregatedDataFromStudentInfo[i]["orientation"];
                indexed_aggregatedDataFromStudentInfo[key] = aggregatedDataFromStudentInfo[i]["numberOfStudents"];
            }
            for (let i = 0 ; i < lengthAggregatedDataFromContentMappings ; i++){
                let key = aggregatedDataFromContentMappings[i]["class"] + 
                aggregatedDataFromContentMappings[i]["branch"] + aggregatedDataFromContentMappings[i]["orientation"];
                aggregatedDataFromContentMappings[i]["numberOfStudentsAttempted"] = indexed_aggregatedDataFromMasterResults[key];
                aggregatedDataFromContentMappings[i]["numberOfStudents"] = indexed_aggregatedDataFromStudentInfo[key];
            }
            await PracticeSummaryModel.remove({});
            let chunks = [], chunk = 50000;
            for(let i = 0 ; i<  aggregatedDataFromContentMappings.length; i+=chunk){
                chunks.push(aggregatedDataFromContentMappings.slice(i, chunk+i));
            }
            for(let i = 0 ; i < chunks.length ; i++){
                await PracticeSummaryModel.insertMany(chunks[i]);
            }
            console.log("DONE")
        }catch(err){
            console.log(err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}
export default { practiceSummary };
