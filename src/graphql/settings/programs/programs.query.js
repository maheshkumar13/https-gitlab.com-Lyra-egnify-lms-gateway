
import { GraphQLList as List } from 'graphql';
import { ProgramInputType, ProgramOutputType } from './programs.type';


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

export default{
  Programs,
};
