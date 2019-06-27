/**
   @description GraphQl queries for Institute Hierarchy.

   @author sai
   @date   25/06/2019
   @version 1.0.0
*/

import {PackageListInputType, PackageListOutputType } from './package.type';

const controller = require('../../../api/settings/package/package.controller');

export const PackageList = {
  args: {
    input: { type: PackageListInputType },
  },
  type: PackageListOutputType,
  async resolve(obj,args, context) {
    return controller.listOfPackages(args.input,context);
  },
};


export default { PackageList };
