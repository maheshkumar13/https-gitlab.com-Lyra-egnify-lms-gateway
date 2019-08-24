import GraphQLJSON from 'graphql-type-json';
import {
    GraphQLString as StringType
} from 'graphql'
import { listTest } from '../../../api/tests/upload/test.upload.controller';

export const ListTest = {
    args : {
        class_code : { type : StringType },
        textbook_code : { type : StringType},
        subject_code : { type : StringType },
        search_query : { type : StringType },
        sort_order : { type : StringType }
     },
    type : GraphQLJSON,
    async resolve(object, args , context ) {
        try{
            return await listTest(args,context);
        }catch(err){
            throw new Error(err);
        }
    }
}