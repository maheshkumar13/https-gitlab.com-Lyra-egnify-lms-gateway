/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import { GraphQLList as List } from 'graphql';

import { InstituteType } from './institute.type';

const controller = require('../../../api/settings/institute/institute.controller');

export const Institute = {
  type: new List(InstituteType),
  async resolve(obj, args, context) {
    // const url = `${config.services.settings}/api/institute/getInstituteDetails`;
    return controller.getInstituteDetails(args, context)
      .then(instituteDetails => instituteDetails).catch(err => err);
  },
};

export default { Institute };
