import {listTest , listTextBooksWithTestSubectWise , listUpcomingTestTextBookWise,listOfCompletedTestTextBookWise , headerCount} from '../../../api/tests/upload/test.upload.controller';
import {ListInputType,ListTestOutput , TestHeadersAssetCountInputType} from './upload.type';
import {getStudentDetailsById} from '../../../api/settings/student/student.controller';
import {checkStudentHasTextbook} from '../../../api/settings/textbook/textbook.controller';
import {GraphQLString as StringType,GraphQLNonNull as NonNull} from 'graphql';
import {getSubjects} from '../../../api/settings/subject/subject.controller';
import GraphQLJSON from 'graphql-type-json';

export const ListTest = {
    args: {
        input: {
            type: ListInputType
        }
    },
    type: ListTestOutput,
    async resolve(object, args, context) {
        try {
            return await listTest(args.input, context);
        } catch (err) {
            throw new Error(err);
        }
    }
}

export const UpcomingTests = {
    args: {
        textbookCode: {
            type: NonNull(StringType)
        }
    },
    type: GraphQLJSON,
    async resolve(object, args, context) {
        try {
            let studentInfo = await getStudentDetailsById({studentId: context.studentId}, context);
            if(!studentInfo){
                throw "Invalid Student";
            }
            let branchOfStudent = context.rawHierarchy[4]["child"];
            let orientationOfStudent = studentInfo["orientation"];
            let classOfStudent = context.rawHierarchy[1]["childCode"];
            let textbookCode = args.textbookCode;
            let textBookdetails = await checkStudentHasTextbook({
                branchOfStudent,
                orientationOfStudent,
                classOfStudent,
                textbookCode
            }, context);
            if (!textBookdetails) {
                throw "Invalid TextBook"
            }
            return await listUpcomingTestTextBookWise(args, context);
        } catch (err) {
            throw new Error(err);
        }
    }
}

export const ListSubjectWiseBooksAndTestCount = {
    args: {
        subjectCode: {
            type: NonNull(StringType)
        }
    },
    type: GraphQLJSON,
    async resolve(object, args, context) {
        try{
            const subjectsListOfStudent = await getSubjects(args,context);
            const  subjectIndex = subjectsListOfStudent.findIndex((obj)=> obj.code === args.subjectCode);
            if(subjectIndex == -1){
                throw "Invalid Subject"
            }
            return await listTextBooksWithTestSubectWise(args,context);
        }catch(err){
            throw new Error(err);
        }
    }
}

export const CompletedTests = {
    args: {
        textbookCode: {
            type: NonNull(StringType)
        }
    },
    type: GraphQLJSON,
    async resolve(object, args, context) {
        try {
            let studentInfo = await getStudentDetailsById({studentId: context.studentId}, context);
            if(!studentInfo){
                throw "Invalid Student";
            }
            let branchOfStudent = context.rawHierarchy[4]["child"];
            let orientationOfStudent = studentInfo["orientation"];
            let classOfStudent = context.rawHierarchy[1]["childCode"];
            let textbookCode = args.textbookCode;
            let textBookdetails = await checkStudentHasTextbook({
                branchOfStudent,
                orientationOfStudent,
                classOfStudent,
                textbookCode
            }, context);
            if (!textBookdetails) {
                throw "Invalid TextBook"
            }
            return await listOfCompletedTestTextBookWise(args, context);
        } catch (err) {
            throw new Error(err);
        }
    }
}

// export const StartTest = {
//     args : {
//         questionPaperId : { type : NonNull(StringType) },
//         startTime : { type : NonNull(StringType) }
//     },
//     type : GraphQLJSON,
//     async resolve (object , args , context){
//         try{
//           if(new Date(args.startTime) === "Invalid Date"){
//             throw "Invalid startTime";
//           }
//           let studentInfo = await getStudentDetailsById({studentId: context.studentId}, context);
//           if(!studentInfo){
//             throw "Invalid Student";
//           }
//           let branchOfStudent = context.rawHierarchy[4]["child"];
//           let orientationOfStudent = studentInfo["orientation"];
//           let classOfStudent = context.rawHierarchy[1]["childCode"];
//           args["branchOfStudent"] = branchOfStudent;
//           args["orientationOfStudent"] = orientationOfStudent;
//           args["classOfStudent"] = classOfStudent;
//           return await startTest(args,context);
//         }catch(err){
//             throw new Error(err);
//         }
//     }
// }

export const HeaderCountForTextBookBasedTest = {
    args: {
        input: { type: TestHeadersAssetCountInputType },
    },
    type : GraphQLJSON,
    async resolve (object , args , context){
        try{
          return await headerCount(args.input,context);
        }catch(err){
            throw new Error(err);
        }
    }
}