/* eslint-disable prettier/prettier */
/* eslint no-undef: 0 */
/* eslint no-throw-literal: 0 */
/**
 * getFileStatus - funtion to get status of the file
 *
 * @param  {type} fileStatusId   Unique id for the files stataus
 * @return {type} data about the file status
 */

import { getModel } from './student.model';
export async function getStudentList(args, context) {
    if (!args && !args.Class && !args.Branch && !args.Orientation ) {
        throw new Error("Nothing is Provided");
    }
    const { Class,Branch,Orientation } = args;
    // eslint-disable-next-line no-console
    const query = {};
    if (Orientation && Orientation.length) {
        query.orientation = {
            $in: Orientation
        }
    }
    if (Class && Class.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_2';
        query[hierarchyLevelsKey] = {
            $in: Class
        }
    }
    if (Branch && Branch.length) {
        const hierarchyLevelsKey = 'hierarchyLevels.L_5';
        query[hierarchyLevelsKey]  = {
            $in: Branch
        }
    }
    console.log("query : ",query)
    const Student = await getModel(context);
    return Student.find(query, {_id:0})
        .then(resultObjs => {

            var finalResult = {}
            // if (resultObjs[0]) {
            //     finalResult.studentId = resultObjs[0].studentId;
            //     finalResult.studentName = resultObjs[0].studentName;
            //     finalResult.egnifyId = resultObjs[0].egnifyId;
            //     finalResult.fatherName = resultObjs[0].fatherName;
            //     finalResult.gender = resultObjs[0].gender;
            //     finalResult.dob = resultObjs[0].dob;
            //     finalResult.category = resultObjs[0].category;
            //     finalResult.hierarchy = resultObjs[0].hierarchy;
            //     finalResult.userCreated = resultObjs[0].userCreated;
            //     finalResult.password = resultObjs[0].password;
            //     finalResult.hierarchyLevels = resultObjs[0].hierarchyLevels;
            //     finalResult.orientation = resultObjs[0].orientation;
            //     }
            return resultObjs;

        });
}

export default {
    getStudentList,
};
