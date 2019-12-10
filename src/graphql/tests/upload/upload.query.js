import {listTest , listTextBooksWithTestSubectWise , listUpcomingTestTextBookWise,listOfCompletedTestTextBookWise , headerCount , fetchInstructions  } from '../../../api/tests/upload/test.upload.controller';
import {ListInputType,ListTestOutput , TestHeadersAssetCountInputType} from './upload.type';
import {getStudentDetailsById} from '../../../api/settings/student/student.controller';
import {checkStudentHasTextbook, getTextbooks,getTextbookForTeachers} from '../../../api/settings/textbook/textbook.controller';
import {GraphQLString as StringType,GraphQLNonNull as NonNull } from 'graphql';
import { validateAccess } from '../../../utils/validator';
import GraphQLJSON from 'graphql-type-json';
import {fetchNodesWithContext} from '../../../api/settings/instituteHierarchy/instituteHierarchy.controller'

export const ListTest = {
    args: {
        input: {
            type: ListInputType
        }
    },
    type: ListTestOutput,
    async resolve(object, args, context) {
        try {
            const validRoles = ['CMS_PERFORMANCE_VIEWER'];
            if (!validateAccess(validRoles, context)){
                throw new Error('Access Denied');
            }
            const branchOfTeacher = context.hierarchy.map(x => x.child);
            const orientationOfTeacher = context.orientations;
            const Nodes = await fetchNodesWithContext({},context); //class name and class code
            const classCodes = Nodes.map(obj=>obj.childCode)
            
            if(args.input.classCode){
                if(classCodes.includes(args.input.classCode)){
                    args.classCode = [args.input.classCode]
                }else{
                    throw new Error("Invalid class selection.");
                }
            }else{
                args.classCode = classCodes;
            }

            if(args.input.branch){
                if(!branchOfTeacher.includes(args.input.branch)){
                    throw new Error("Invalid branch selection.")
                }else{
                    args.branch = [args.input.branch]
                }
            }else{
                args.branch = branchOfTeacher.length ? Array.from(new Set(branchOfTeacher)) : []
            }
            if(args.input.orientation){
                if(!orientationOfTeacher.includes(args.input.orientation)){
                    throw new Error("Invalid orientation selection.")
                }else{
                    args.orientation = [args.input.orientation]    
                }
            }else{
                args.orientation = orientationOfTeacher
            }

            if(args.input.subjectCode){
                args["subjectCode"] = [args.input.subjectCode]
            }

            const textbookCode = await getTextbookForTeachers(args, context);
            if(!textbookCode.length){
                throw new Error("Invalid filter selection.");
            }

            if(!args.input.textbookCode){
                args.input.textbookCode = textbookCode
            }else{
                if(!textbookCode.includes(args.input.textbookCode)){
                    throw new Error("Invalid textbook selection");
                }else{
                    args.input.textbookCode = [args.input.textbookCode]
                }
            }
            return listTest(args.input, context);
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
            const validRoles = ['LMS_PERFORMANCE_VIEWER'];
            if (!validateAccess(validRoles, context)){
                throw new Error('Access Denied');
            }
            let studentInfo = await getStudentDetailsById({studentId: context.studentId}, context);
            if(!studentInfo){
                throw "Invalid Student";
            }
            args.branch = studentInfo["hierarchyLevels"]["L_5"];
            args.classCode = studentInfo["hierarchy"][1]["childCode"];
            args.orientation = studentInfo["orientation"];
            const textbooks = await getTextbooks(args, context);
            args.textbookCodes = textbooks.map( textbook => textbook.code)
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

export const FetchInstruction = {
    args: {
        testId: {
            type: NonNull(StringType)
        }
    },
    type : GraphQLJSON,
    async resolve (object , args , context){
        try{
          return await fetchInstructions(args,context);
        }catch(err){
            throw new Error(err);
        }
    }
}