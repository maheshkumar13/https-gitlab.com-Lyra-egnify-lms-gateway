/**
   @description GraphQl queries for Institute Hierarchy.

   @author sai
   @date   25/06/2019
   @version 1.0.0
*/

import {packageListOutputType } from './package.type';

const controller = require('../../../api/settings/package/package.controller');

export const packageList = {
//   args: {
//     input: { type: CreatePackageInputType },
//   },
  type: packageListOutputType,
  async resolve(obj, context) {
    return controller.listOfPackages(context);
  },
};


export default { packageList };
