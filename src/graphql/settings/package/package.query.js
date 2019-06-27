/**
   @description GraphQl queries for Institute Hierarchy.

   @author sai
   @date   25/06/2019
   @version 1.0.0
*/
import {
  GraphQLString as StringType,
} from 'graphql';

import {
  CreatePackageInputType,
  packageListOutputType,
  PackageDetailsOutputType,
} from './package.type';

const controller = require('../../../api/settings/package/package.controller');

export const packageList = {
  args: {
    input: { type: CreatePackageInputType },
  },
  type: packageListOutputType,
  async resolve(obj, context) {
    return controller.listOfPackages(context);
  },
};

export const PackageDetails = {
  args: {
    input: { type: StringType, description: 'packageId of the package' },
  },
  type: PackageDetailsOutputType,
  async resolve(obj, args, context) {
    return controller.getPackageDetails(args, context)
      .then(async json => json);
  },
};


export default { packageList, PackageDetails };
