/**
   @description GraphQl queries for Institute Hierarchy.

   @author Sairam
   @date   25/06/2019
   @version 1.0.0
*/
import {GraphQLList as List} from 'graphql'


import {PackageListInputType, PackageListOutputType } from './package.type';
import { graphql } from 'graphql';

const controller = require('../../../api/settings/package/package.controller');

export const PackageList = {
  args: {
    input: { type: PackageListInputType },
  },
  type: new List(PackageListOutputType),
  async resolve(obj,args, context) {
    return controller.listOfPackages(args.input,context);
  },
};


export default { PackageList };
