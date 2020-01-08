import {
    getModel as TestTimings
} from './testtiming.model';

export async function getTestTiming(req, res) {
    const testId = req.params.testId;
    if(!testId){
        return res.status(400).send("Test id missing.")
    }
    let branches = [];

    req.user_cxt["hierarchy"].forEach(obj=>{
        if(obj["level"] == 5){
            branches.push(obj);
        }
    });

    let {skip, limit, branch} = req.query;
    limit = isNaN(limit) ? 0 : parseInt(limit);
    skip = isNaN(skip) ? 0 : parseInt(skip);

    if(branch && branches.length){
        let index = branches.findIndex(function(obj){
            return obj.child === branch;
        })
        if(index === -1){
            return res.status(403).send("Access denied");
        }
        branches = [branches[index]["childCode"]];
    }else if(branch && !branches.length){
        branches = [branch];
    }


    let aggrArr = [];
    let matchQuery = {$match: {"testId": testId}};

    if(branches.length){
        matchQuery["$match"]["hierarchyId"] = {$in: branches}
    }

    aggrArr.push(matchQuery);
    
    let skipQuery = {$skip: skip };
    aggrArr.push(skipQuery);

    let limitQuery = {$limit: limit};
    
    if(limit){
        aggrArr.push(limitQuery);
    }

    aggrArr.push({
        $lookup: {
            from : "institutehierarchies",
            foreignField:"childCode",
            localField: "hierarchyId",
            as: "hierachyDetails"
        }
    });
    
    aggrArr.push({
        $unwind: "$hierachyDetails"
    });

    aggrArr.push({
        $project: {
            "_id": 0,
            "startTime" : 1,
            "endTime": 1,
            "branchName": "$hierachyDetails.child",
            "duration" : 1,
            "orientations": 1,
            "class": 1
        }
    });

    const TestTimingSchema = await TestTimings(req.user_cxt);    
    const [count,data] = await Promise.all([
        TestTimingSchema.count(matchQuery["$match"]),
        TestTimingSchema.aggregate(aggrArr).allowDiskUse(true)
    ]);

    return res.status(200).send({
        count,
        data
    });
}