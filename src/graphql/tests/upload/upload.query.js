import GraphQLJSON from 'graphql-type-json';
import { listTest } from '../../../api/tests/upload/test.upload.controller';
import { ListInputType , ListTestOutput } from './upload.type';


export const ListTest = {
    args : {
        input:{
            type : ListInputType
        }
     },
    type : ListTestOutput,
    async resolve(object, args , context ) {
        try{
            return await listTest(args.input,context);
        }catch(err){
            throw new Error(err);
        }
    }
}