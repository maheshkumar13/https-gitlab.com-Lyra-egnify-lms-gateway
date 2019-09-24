import GraphQLJSON from 'graphql-type-json';
import {
    GraphQLString as StringType,
    GraphQLNonNull as NonNull
} from 'graphql';

import { TestUploadInputType ,TestUpdateInputType} from './upload.type'
import { publishTest , parseAndValidateTest, updateTest , completeTest , startTest} from '../../../api/tests/upload/test.upload.controller';
import {getStudentDetailsById} from '../../../api/settings/student/student.controller';

export const PublishTest = {
    args : {
        id : {type : StringType}
    },
    type : GraphQLJSON,
    async  resolve( obj , args , context){
        try{
            return await publishTest(args,context);
        }catch(err){
            throw new Error(err);
        }
    }
}

export const ParseAndValidateTest = {
    args : {
        input : {
            type : TestUploadInputType
        }
    },
    type :  GraphQLJSON,
    async resolve(obj , args, context){
        try{
            return await parseAndValidateTest(args.input,context);
        }catch(err){
            throw new Error(err);
        }
    }
}

export const updateTestInfo = {
    args : {
        input : {type : TestUpdateInputType}
    },
    type : GraphQLJSON,
    async resolve (obj ,args, context){
        try{
            return await updateTest(args.input , context);
        }catch(err){
            throw new Error(err);
        }
    }
}

export const SubmitTest = {
    args : {
        testId: {
            type: NonNull(StringType)
        },
        rawResponse : {
            type : GraphQLJSON
        }
    },
    type : GraphQLJSON,
    async resolve(object , args ,context){
        try{
            return await completeTest(args, context);
        }catch(err){
            throw new Error(err);
        }
    }
}

export const StartTest = {
    args : {
        questionPaperId : { type : NonNull(StringType) },
    },
    type : GraphQLJSON,
    async resolve (object , args , context){
        try{
          if(new Date(args.startTime) === "Invalid Date"){
            throw "Invalid startTime";
          }
          let studentInfo = await getStudentDetailsById({studentId: context.studentId}, context);
          if(!studentInfo){
            throw "Invalid Student";
          }
          let branchOfStudent = context.rawHierarchy[4]["child"];
          let orientationOfStudent = studentInfo["orientation"];
          let classOfStudent = context.rawHierarchy[1]["childCode"];
          args["branchOfStudent"] = branchOfStudent;
          args["orientationOfStudent"] = orientationOfStudent;
          args["classOfStudent"] = classOfStudent;
          return await startTest(args,context);
        }catch(err){
            throw new Error(err);
        }
    }
}