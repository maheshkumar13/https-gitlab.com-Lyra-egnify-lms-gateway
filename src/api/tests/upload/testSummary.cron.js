const cron = require('node-cron');
import { getModel as TextbookSchema } from '../../settings/textbook/textbook.model';
import { getModel as MasterResultSchema }from './masterresults.model';
import { getModel as TestSummarySchema } from './testSummary.model';
import { getModel as StudentInfoModel } from '../../settings/student/student.model';
const instituteId = "Egni_u001"

export function TestSummary() {
    cron.schedule('0 0 3 * * *', async () => {
        try{
            const Textbook = await TextbookSchema({instituteId});
            const MasterResults = await MasterResultSchema({instituteId});
            const TestSummaryModel = await TestSummarySchema({instituteId});
            const StudentInfo = await StudentInfoModel({instituteId});

            const aggregateQueryForTests = [
                {
                    "$match": {
                        "active": true
                    }
                },
                {
                    "$lookup": {
                        "from": "tests",
                        "let": {
                            "code": "$code"
                        },
                        "pipeline": [{
                            "$match": {
                                "$expr": {"$eq": ["$mapping.textbook.code", "$$code"]},
                                "active": true,
                                "gaStatus": "finished"
                                }
                        }],
                        "as": "tests"
                    }
                },
                {
                    "$project": {
                        "orientation": "$orientations",
                        "branch": "$branches",
                        "class": "$refs.class.name",
                        "numberOfTests": {
                            "$cond": {
                                "if": {
                                    "$isArray": "$tests"
                                },
                                "then": {
                                    "$size": "$tests"
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
                           numberOfTests: {$sum: "$numberOfTests"}
                    }
                },
                {
                    "$project": {
                        "orientation": "$_id.orientation",
                        "branch": "$_id.branch",
                        "class": "$_id.class",
                        "numberOfTests": 1,
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
                        "noOfStudentAttemptedTest": "$count",
                        "_id": 0
                    }
                }
            ]

            let aggregatedDataFromTests = await Textbook.aggregate(aggregateQueryForTests).allowDiskUse(true);
            let aggregatedDataFromMasterResults = await MasterResults.aggregate(aggregateQueryForMasterResults).allowDiskUse(true);
            let aggregatedDataFromStudentInfo = await StudentInfo.aggregate(aggregateQueryForStudentInfo).allowDiskUse(true);
            const lengthAggregatedDataFromTests = aggregatedDataFromTests.length;
            const lengthAggregatedDataFromMasterResults = aggregatedDataFromMasterResults.length;
            const lengthAggregatedDataFromStudentInfo = aggregatedDataFromStudentInfo.length;
            let indexed_aggregatedDataFromMasterResults = {};
            let indexed_aggregatedDataFromStudentInfo = {};
            for (let i = 0 ; i < lengthAggregatedDataFromMasterResults ; i++){
                let key = aggregatedDataFromMasterResults[i]["class"] + 
                aggregatedDataFromMasterResults[i]["branch"] + aggregatedDataFromMasterResults[i]["orientation"];
                indexed_aggregatedDataFromMasterResults[key] = aggregatedDataFromMasterResults[i]["noOfStudentAttemptedTest"];
            }
            for(let i = 0; i < lengthAggregatedDataFromStudentInfo; i++ ){
                let key = aggregatedDataFromStudentInfo[i]["class"] + 
                aggregatedDataFromStudentInfo[i]["branch"] + aggregatedDataFromStudentInfo[i]["orientation"];
                indexed_aggregatedDataFromStudentInfo[key] = aggregatedDataFromStudentInfo[i]["numberOfStudents"];
            }
            for (let i = 0 ; i < lengthAggregatedDataFromTests ; i++){
                let key = aggregatedDataFromTests[i]["class"] + 
                aggregatedDataFromTests[i]["branch"] + aggregatedDataFromTests[i]["orientation"];
                aggregatedDataFromTests[i]["numberOfStudentsAttempted"] = indexed_aggregatedDataFromMasterResults[key];
                aggregatedDataFromTests[i]["numberOfStudents"] = indexed_aggregatedDataFromStudentInfo[key];
            }
            await TestSummaryModel.remove({});
            await TestSummaryModel.create(aggregatedDataFromTests);
        }catch(err){
            console.log(err);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}
export default { TestSummary };
