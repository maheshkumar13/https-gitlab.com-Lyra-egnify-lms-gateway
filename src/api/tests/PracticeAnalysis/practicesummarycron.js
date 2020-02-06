const cron = require('node-cron');
import { getModel as TextbookSchema } from '../../settings/textbook/textbook.model';
import { getModel as MasterResultSchema }from '../masterResults/masterResults.model';
import { getModel as PracticeSummarySchema } from './practicesummary.model';
const instituteId = "Egni_u001"

export async function practiceSummary() {
    cron.schedule('0 1 * * * *', () => {
        try{
            const Textbook = await TextbookSchema({instituteId});
            const MasterResults = await MasterResultSchema({instituteId});
            const PracticeSummary = await PracticeSummarySchema({instituteId});
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
                },{
                    "$lookup":{
                        "from": "studentInfo",
                        "let": { "class": "$class", "branch": "$branch", "orientation": "$orientation"},
                        "pipeline": [{
                            "$match":{
                                "$expr":{
                                    "$and":[
                                        {"$eq": ["$hierarchyLevels.L_2", "$$class"]},
                                        {"$eq": ["$hierarchyLevels.L_5", "$$branch"]},
                                        {"$eq": ["$orientation", "$$orientation"]}
                                    ]
                                }
                            }
                        }],
                        "as": "students"
                    }
                },
                {
                    "$project": {
                        "orientation": 1,
                        "branch": 1,
                        "class": 1,
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
            let aggregatedDataFromContentMappings = await Textbook.aggregate(aggregateQueryForContentMappings);
            let aggregatedDataFromMasterResults = await MasterResults(aggregateQueryForMasterResults);
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
            await PracticeSummary.remove({});
            await PracticeSummary.insertMany(aggregatedDataFromContentMappings);
        }catch(err){
            console.log(err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}
export default { practiceSummary };
