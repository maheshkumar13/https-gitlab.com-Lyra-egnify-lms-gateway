
import { GraphQLList as List , GraphQLString as StringType} from 'graphql';
import { ProgramInputType, ProgramOutputType } from './programs.type';
import GraphQLJSON from 'graphql-type-json';
import {fetchNodesWithContext} from '../../../api/settings/instituteHierarchy/instituteHierarchy.controller'

const controller = require('../../../api/settings/programs/programs.controller');

export const Programs = {
  args: {
    input: { type: ProgramInputType },
  },
  type: new List(ProgramOutputType),
  async resolve(obj, args, context) {
    return controller.fetchProgramsBasedOnBoard(args, context);
  },
};

export const orientationFilter = {
  args: {
    classes : {type : new List(StringType)},
    states: {type : new List(StringType)},
    cities: {type : new List(StringType)},
    branches: {type : new List(StringType)},
    sections: {type : new List(StringType)},
  },
  type: GraphQLJSON,
  async resolve(obj, args, context) {
    
    const nodes = await fetchNodesWithContext({levelNames:["Branch"]}, context);
    const validBranches = nodes.map(node => {return node.child})
    const validSet = new Set(validBranches)
    if(args.branches && args.branches.length){
      for(let i = 0 ; i < args.branches.length; i++){
        if(!validSet.has(args.branches[i])){
          return "Inaccessible branch."
        }
      }
    }else{
      args.branches = validBranches
    }

    return controller.getOrientationFilter(args, context);
  },
};

export default{
  Programs,
  orientationFilter,
};
