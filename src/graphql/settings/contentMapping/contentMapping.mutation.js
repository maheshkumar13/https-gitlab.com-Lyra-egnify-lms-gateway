/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aakash Parsi
   @date   09/05/2019
   @version 1.0.0
*/

import {
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { ContentMappingInsertionInputType,UpdateContentOutputType,UpdateContentInputType } from './contentMapping.type';

const controller = require('../../../api/settings/contentMapping/contentMapping.controller');

export const InsertContent = {
  args: {
    input: { type: new NonNull(ContentMappingInsertionInputType) },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.insertContent(args.input, context);
  },
};

export const UpdateContent ={
  args:{
    input :{type : UpdateContentInputType} ,
  },
  type : GraphQLJSON,
  async resolve(obj,args,context){
    return controller.updateContent(args,context);
  }
}

export default { 
  InsertContent,
  UpdateContent,
};
