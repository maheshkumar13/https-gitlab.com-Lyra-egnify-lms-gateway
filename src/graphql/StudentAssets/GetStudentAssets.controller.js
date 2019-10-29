/* eslint-disable prettier/prettier */
/* eslint no-undef: 0 */
/* eslint no-throw-literal: 0 */
/**
 * getFileStatus - funtion to get status of the file
 *
 * @param  {type} fileStatusId   Unique id for the files stataus
 * @return {type} data about the file status
 */
import { getModel as getModelStudent } from '../../api/settings/student/student.model';

export async function getAssets(args, context) {
    console.log("args: ",args);
    const { studentId } = args;
    // eslint-disable-next-line no-console
    // console.log("testIds", testId);
    const query = { studentId };
    console.log("query: ", query);

    // if (testId && testId.length) {
    //     query.testId = {
    //         $in: testId
    //     }

    // }
    const student = await getModelStudent(context);
    console.log("context : ", context);
    var result;
    return student.findOne(query, { studentId: 1, studentName: 1, hierarchy:1}).exec().then(doc => {
        const x = doc.hierarchy[1].childCode;
        console.log("doc.hierarchy :",x);
        return doc;
    }).catch(err => err);
}


export default {
    getAssets,
};
