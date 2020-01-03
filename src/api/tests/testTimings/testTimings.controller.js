
import { getModel as testTimingsModel } from './testTimings.model';
import { getModel as instituteHierarchyModel } from '../../settings/instituteHierarchy/instituteHierarchy.model';
export async function getTestTimings(req, res) {
    try {
        //get collections
        const [TestTimings,InstituteHierarchy] = await Promise.all([testTimingsModel(req.user_cxt),instituteHierarchyModel(req.user_cxt)]);
        //extract query parameters
        let { testId,branch,skip,limit } = req.query;
        skip=Number(skip)
        limit=Number(limit)
        //check if testId is missing.
        if (!testId) {
            return res.status(400).json({
                status: "failure",
                message: "testId is missing !!!",
                data: ""
            });
        }
        //validate if giving testId is valid or not
        let [testIdConfirmation,branchConfirmation]= await Promise.all([TestTimings.findOne({testId}),InstituteHierarchy.findOne({child:branch})]);
        if(!testIdConfirmation){
            return res.status(400).json({
                status: "failure",
                message: "Invalid Test Id !!!",
                data: ""
            });
        }
        //validate if giving branch is valid or not
        if(!branchConfirmation && branch){
            return res.status(400).json({
                status: "failure",
                message: "Invalid branch name!!!",
                data: ""
            });
        }
        //prepare query for match 
        const matchQuery = {testId}
        if(req.user_cxt.hierarchy.length>=5 && !branch) matchQuery.hierarchyId={$in:req.user_cxt.hierarchy.map(x=>x.childCode)}
        if(branch) matchQuery.hierarchyId=branchConfirmation.childCode
        //query test data !!!
        const count = await TestTimings.count(matchQuery);
        if(limit<=0){
            limit=count
            skip=0
        } 
        const resData = await TestTimings.aggregate([{$match:matchQuery},
            {$lookup: {
                from:'institutehierarchies', 
                localField: 'hierarchyId', 
                foreignField:'childCode', 
                as: "branch"}
            },
            { $unwind:"$branch" },
            {$lookup: { 
                from: "tests",
                localField: "testId", 
                foreignField: "testId",
                as: "testData"}
            },
            { $unwind:"$testData" },
            {$skip:skip},
            {$limit:limit},
            {$project:{
                _id:1,testId:1,class:1,orientations:1,startTime:1,endTime:1,
                duration:1,'branch.childCode':1,'branch.child':1,'testData.testName':1}
            }
        ]);
        if (!resData) {
            return res.status(204).json({
                status: "failure",
                message: "No Data Found !!!",
                data:[]
            });
        }
       let data={"count":count,"data":resData}
       return res.status(200).send(data);
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: "failure",
            message: "Internal Server Error !!!",
            data: ""
        });
    };
}
export default { getTestTimings};
