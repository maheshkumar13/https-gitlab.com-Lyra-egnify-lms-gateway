import GraphQLJSON from 'graphql-type-json';
import {
  GraphQLString
} from 'graphql'

import { listMarkingSchema } from '../../../api/tests/markingScheme/marking.scheme.controller';

export const ListMarkingSchema = {
    args : {
      id : { type : GraphQLString , description:"Can be null"} // if null, all the marking schema will be returned.
    },
    type: GraphQLJSON,
    async resolve(obj,args, context) {
      try{
        return await listMarkingSchema(args , context);      
      }catch(e){
        throw new Error(e);
      }
    }
};