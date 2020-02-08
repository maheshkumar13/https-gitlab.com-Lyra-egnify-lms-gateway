const cron = require('node-cron');
import { getModel as TextbookSchema } from '../../settings/textbook/textbook.model';
import { getModel as MasterResultSchema }from '../masterResults/masterResults.model';
import { getModel as PracticeSummarySchema } from './practicesummary.model';
const instituteId = "Egni_u001"

export async function practiceSummary() {
    // * * * * *
    // 0 1 * * * *
    cron.schedule('0 2 * * * *', async () => {
        try{
            let time = new Date().getMilliseconds();
            const Textbook = await TextbookSchema({instituteId});
            const MasterResults = await MasterResultSchema({instituteId});
            const PracticeSummaryModel = await PracticeSummarySchema({instituteId});
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
                                "$expr": {
                                    "$and": [{
                                            "$eq": ["$refs.textbook.code", "$$code"]
                                        },
                                        {
                                            "$eq": ["$content.category", "Practice"]
                                        },
                                        {
                                            "$eq": ["$active", true]
                                        }
                                    ]
                                }
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
                        "numberOfStudents": {
                            "$cond": {
                                "if": {
                                    "$isArray": "$students"
                                },
                                "then": {
                                    "$size": "$students"
                                },
                                "else": 0
                            }
                        }
                    }
                }
            ]

            // {
            //     "$lookup":{
            //         "from": "studentInfo",
            //         "let": { "class": "$_id.class", "branch": "$_id.branch", "orientation": "$_id.orientation"},
            //         "pipeline": [{
            //             "$match":{
            //                 "$expr":{
            //                     "$and":[
            //                         {"$eq": ["$hierarchyLevels.L_2", "$$class"]},
            //                         {"$eq": ["$hierarchyLevels.L_5", "$$branch"]},
            //                         {"$eq": ["$orientation", "$$orientation"]}
            //                     ]
            //                 }
            //             }
            //         }],
            //         "as": "students"
            //     }
            // },
            
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
                        "orientation": "_id.orientation",
                        "noOfStudentAttemptedPractice": "$count",
                        "_id": 0
                    }
                }
            ]
            let aggregatedDataFromContentMappings = await Textbook.aggregate(aggregateQueryForContentMappings).allowDiskUse(true);
            console.log(new Date().getMilliseconds() - time);
            let aggregatedDataFromMasterResults = await MasterResults.aggregate(aggregateQueryForMasterResults).allowDiskUse(true);
            console.log(new Date().getMilliseconds() - time);
            const lengthAggregatedDataFromContentMappings = aggregatedDataFromContentMappings.length;
            const lengthAggregatedDataFromMasterResults = aggregatedDataFromMasterResults.length;
            let indexed_aggregatedDataFromMasterResults = {};
            for (let i = 0 ; i < lengthAggregatedDataFromMasterResults ; i++){
                let key = aggregatedDataFromMasterResults[i]["class"] + 
                aggregatedDataFromMasterResults[i]["branch"] + aggregatedDataFromMasterResults[i]["orientation"];
                indexed_aggregatedDataFromMasterResults[key] = aggregatedDataFromMasterResults[i]["noOfStudentAttemptedPractice"];
            }
            for (let i = 0 ; i < lengthAggregatedDataFromContentMappings ; i++){
                let key = aggregatedDataFromContentMappings[i]["class"] + 
                aggregatedDataFromContentMappings[i]["branch"] + aggregatedDataFromContentMappings[i]["orientation"];
                aggregatedDataFromContentMappings[i]["numberOfStudentsAttempted"] = indexed_aggregatedDataFromMasterResults[key];
            }
            await PracticeSummaryModel.remove({});
            await PracticeSummaryModel.create(aggregatedDataFromContentMappings);
            console.log(new Date().getMilliseconds() - time);
        }catch(err){
            console.log(err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}
export default { practiceSummary };
