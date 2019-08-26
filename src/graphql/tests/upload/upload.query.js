import GraphQLJSON from 'graphql-type-json';
import { listTest } from '../../../api/tests/upload/test.upload.controller';
import { ListInputType } from './upload.type';

export const ListTest = {
    args : {
        input:{
            type : ListInputType
        }
     },
    type : GraphQLJSON,
    async resolve(object, args , context ) {
        try{
            return await listTest(args.input,context);
        }catch(err){
            throw new Error(err);
        }
    }
}