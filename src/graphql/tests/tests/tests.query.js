
/**
   @author Sarvagya
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
  
  } from 'graphql';
  
  const controller = require('../../../api/tests/tests/tests.controller');

  export const FindOrientations = {
    args : {
      class : {type : StringType , description : 'Class for which test has to be made'},
    },
    type : new List(StringType),
    async resolve(obj , args , context){
      return controller.getOrientations(args , context);
    }
  }

  export const FindBranches = {
    args : {
      class : {type : StringType , description : 'Class for which test has to be made'},
    },
    type : new List(StringType),
    async resolve(obj , args , context){
      return controller.getBranches(args , context);
    }
  }

  export default{
    FindOrientations,
    FindBranches,
  };