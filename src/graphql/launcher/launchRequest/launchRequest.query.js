/**
   @author Aslam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,

} from 'graphql';

import { LaunchRequestType } from './launchRequest.type';

const controller = require('../../../api/launcher/launchRequest/launchRequest.controller');

export const LaunchRequest = {
  args: {
    key: { type: NonNull(StringType), description: 'Storage Key' },
  },
  type: LaunchRequestType,
  async resolve(obj, args, context) {
    // console.log(controller.getPreSignedUrl(args, context))
    return controller.getPreSignedUrl(args, context);
  },
};

export default {
  LaunchRequest,
};
