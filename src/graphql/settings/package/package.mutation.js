/**
   @description GraphQl queries for Institute Hierarchy.

   @author Aakash Parsi
   @date   18/04/2019
   @version 1.0.0
*/

import { CreatePackageInputType, CreatePackageOutputType } from './package.type';

const controller = require('../../../api/settings/package/package.controller');

export const CreatePackage = {
  args: {
    input: { type: CreatePackageInputType },
  },
  type: CreatePackageOutputType,
  async resolve(obj, args, context) {
    return controller.createNewPackage(args.input, context);
  },
};


export default { CreatePackage };
