/**
   @author Parsi
   @date    XX/XX/XXXX
   @version 1.0.0
*/

// import {
//   GraphQLList as List,
//   GraphQLNonNull as NonNull,
//   GraphQLString as StringType,
//
// } from 'graphql';

import { MasterResultOutputType, MasterResultInputType } from './masterResults.type';

const controller = require('../../../api/tests/masterResults/masterResults.controller');

export const MasterResults = {
  args: {
    input: { type: MasterResultInputType, description: 'Question Paper Id and student responses' },
  },
  type: MasterResultOutputType,
  async resolve(obj, args, context) {
    return controller.getMasterResults(args, context);
  },
};

export default{
  MasterResults,
};
