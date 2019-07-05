/**
   @description GraphQl queries for Institute Hierarchy.

   @author sai
   @date   25/06/2019
   @version 1.0.0
*/
import {
  GraphQLString as StringType,
  GraphQLList as List,
} from 'graphql';

import {
  CreatePackageInputType,
  PackageListInputType,
  PackageListOutputType,
  PackageDetailsOutputType,
} from './package.type';

import { graphql } from 'graphql';

const controller = require('../../../api/settings/package/package.controller');

export const PackageDetails = {
  args: {
    input: { type: StringType, description: 'packageId of the package' },
  },
  type: PackageDetailsOutputType,
  async resolve(obj, args, context) {
    return controller.getPackageDetails(args, context)
      .then(async json => json)
      .catch(err => err);
  }
}

export const PackageList = {
  args: {
    input: { type: PackageListInputType },
  },
  type: new List(PackageListOutputType),
  async resolve(obj,args, context) {
    return controller.listOfPackages(args.input,context);
  },
};


export default { PackageList, PackageDetails };
