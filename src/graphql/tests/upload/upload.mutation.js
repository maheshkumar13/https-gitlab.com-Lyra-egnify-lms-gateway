import GraphQLJSON from 'graphql-type-json';
import {
    GraphQLString as StringType
} from 'graphql';

import { publishTest } from '../../../api/tests/upload/test.upload.controller';

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