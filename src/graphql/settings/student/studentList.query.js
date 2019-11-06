import {
    GraphQLString as StringType,
    GraphQLList as List,
} from 'graphql';
import { StudentListType } from './studentList.type';
const StudentListController = require('../../../api/settings/student/studentList.controller');
export const StudentList = {
    args: {
        Class: { type: new List(StringType) },
        Orientation: { type: new List(StringType) },
        Branch: { type: new List(StringType) },
    }, 
    type: new List(StudentListType),
    async resolve(obj, args, context) {
        return StudentListController.getStudentList(args, context)
            .then(docs => docs)
            .catch(err => {
                console.error('err is', err);
                throw new Error(err);
            });
    },
};
export default {
    StudentList,
};