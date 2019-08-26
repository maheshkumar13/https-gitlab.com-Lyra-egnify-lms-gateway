import {
  GraphQLString,
  GraphQLList as ListType
} from 'graphql'

import { listMarkingSchema } from '../../../api/tests/markingScheme/marking.scheme.controller';
import { MarkingSchemaOutPut } from './marking.schema.type';
export const ListMarkingSchema = {
    args : {
      id : { type : GraphQLString , description:"Can be null"} // if null, all the marking schema will be returned.
    },
    type: new ListType(MarkingSchemaOutPut),
    async resolve(obj,args, context) {
      try{
        return await listMarkingSchema(args , context);      
      }catch(e){
        throw new Error(e);
      }
    }
};