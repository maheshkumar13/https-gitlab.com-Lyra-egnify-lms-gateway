import GraphQLJSON from 'graphql-type-json';
import {
    GraphQLString as StringType,
} from 'graphql';

import { TestUploadInputType ,TestUpdateInputType} from './upload.type'
import { publishTest , parseAndValidateTest, updateTest} from '../../../api/tests/upload/test.upload.controller';

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