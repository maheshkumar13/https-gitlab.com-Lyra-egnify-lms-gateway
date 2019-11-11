
import { uniqBy, filter } from 'lodash';

/* eslint import/no-named-as-default-member: 0 */
import { getModel } from './student.model';
import { getModel as SubjectModel } from '../subject/subject.model';
import { getLastKLevels } from '../institute/institute.controller';
import { config } from '../../../config/environment';
import { Query } from 'mongoose';

async function getActiveStudents(context, studentIdList) {

  //  const url = `${config.services.sso}/api/v1/users/getActiveStudents`;
    const url = `http://localhost:3002/api/v1/users/getActiveStudents`;
    try{
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ studentIdList }),
            headers: {
                'Content-Type': 'application/json',
                "authorization": context.token.authorization,
                "accesscontrolToken": context.token.accesscontroltoken,
            },
        });
        let json = await response.json();
        return json;
    }catch(err){
        console.log("Err", err)
        return new Error(response.statusText); 
    }
}



export async function getStudentHeader(args,context) {
   
    if (!args &&
        !args.className && 
        !args.branch && 
        !args.orientation && 
        !args.country && 
        !args.state && 
        !args.city && 
        !args.section) {
        throw new Error("Nothing is Provided");
    }
    //Query Prepartion
    const query = {};
    if (args.country && args.country.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_1';
        query[hierarchyLevelsKey] ={
            $in: args.country
        }
    }
    if (args.className && args.className.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_2';
        query[hierarchyLevelsKey] = {
            $in: args.className
        }
    }
    if (args.state && args.state.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_3';
        query[hierarchyLevelsKey] = {
            $in: args.state
        }
    }
    if (args.city && args.city.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_4';
        query[hierarchyLevelsKey] = {
            $in: args.city
        }
    }
    if (args.branch && args.branch.length ) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_5';
        query[hierarchyLevelsKey] = {
            $in: args.branch
        }
    }
    if (args.section && args.section.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_6';
        query[hierarchyLevelsKey] = {
            $in: args.section
        }
    }
    if (args.orientation && args.orientation.length) {
        query.orientation = {
            $in: args.orientation
        }
    }

    try {
        const Student = await getModel(context);
        const headerData = await Student.aggregate([{
            $match:query
        }, {
                $group: {
                
                    _id: null,   orientation: { $addToSet: "$orientation" },
                                 country: { $addToSet: "$hierarchyLevels.L_1" }, 
                                 className: { $addToSet: "$hierarchyLevels.L_2" }, 
                                 state: { $addToSet: "$hierarchyLevels.L_3" }, 
                                 city: { $addToSet: "$hierarchyLevels.L_4" }, 
                                 branch: { $addToSet: "$hierarchyLevels.L_5" }, 
                                 section: { $addToSet: "$hierarchyLevels.L_6" },
                                 studentIdList: { $addToSet: "$studentId" },
                },                     
            }, 
        ]);
        let activationsData = await getActiveStudents(context,headerData[0].studentIdList)
       activationsData=activationsData.length;
        let returnData={}
        let headerReturnData = {}
        if (headerData.length){
            if (!args.country) {
                headerReturnData["country"] = headerData[0].country
            } 
            if (!args.state) {
                headerReturnData["state"] = headerData[0].state

            } 
            if (!args.city) {
                headerReturnData["city"] = headerData[0].city

            } 
            if (!args.branch) {
                headerReturnData["branch"] = headerData[0].branch

            } else {
                

            }
            if (!args.className) {
                headerReturnData["className"] = headerData[0].className

            }
            if (!args.section) {
                headerReturnData["section"] = headerData[0].section
            }
            if (!args.orientation) {
                headerReturnData["orientation"] = headerData[0].orientation
            } 


        }else{
            
            headerReturnData["country"]=[],
            headerReturnData["state"]=[],
            headerReturnData["branch"]=[],
            headerReturnData["city"]=[],
            headerReturnData["className"]=[],
            headerReturnData["section"]=[],
            headerReturnData["orientation"]=[]
    
        }
       
        
            const summaryData = await Student.aggregate([{
                $match: query
            }, {
                $project: {
                    male: { $cond: [{ $eq: ["$gender", "M"] }, 1, 0] },
                    female: { $cond: [{ $eq: ["$gender", "F"] }, 1, 0] },
                    prepSkill: { $cond: [{ $eq: ["$prepSkill", true] }, 1, 0] },
                }
            },
            {
                $group: {
                    _id: null, male: { $sum: "$male" },
                    female: { $sum: "$female" },
                    prepSkill: { $sum: "$prepSkill" },
                    total: { $sum: 1 },
                    digitalContent: { $sum: 1 },
                }
            },
            ]);
        
      
        if (summaryData.length){
            let summaryReturnData = {}
        
                summaryReturnData["totalStudent"]= summaryData[0].total,
                summaryReturnData["digitalContent"]= summaryData[0].digitalContent,
                summaryReturnData["male"]= summaryData[0].male,
                summaryReturnData["female"]= summaryData[0].female,
                summaryReturnData["prepSkill"]= summaryData[0].prepSkill,
                    summaryReturnData["activation"] = activationsData,
            
            returnData = {
                    "summary": summaryReturnData,
                "headers": headerReturnData,

            }
            return returnData;
        }else{
            let summaryReturnData = {}
            
                summaryReturnData["totalStudent"]= 0,
                summaryReturnData["digitalContent"]= 0,
                summaryReturnData["male"]=0,
                summaryReturnData["female"]= 0,
                summaryReturnData["prepSkill"]= 0,
                summaryReturnData["activation"]= 0,
            
           
            returnData = {
                    "summary": summaryReturnData,
                "headers": headerReturnData,
            }
            
            return returnData;
        }     

    } catch (err) {
        console.error(err)
        throw new Error("Failed to Query");

    }
}
export default {
    getStudentHeader
};
