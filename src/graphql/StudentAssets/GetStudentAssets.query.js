/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/


import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLList as List,
    GraphQLBoolean as BooleanType,
} from 'graphql';

import { AssetsType } from './GetStudentAssets.type';

const controller = require('./GetStudentAssets.controller');

export const GetStudentAssets = {
    args: {
        studentId: { type: new NonNull(StringType) },
    },
    type: AssetsType,
    async resolve(obj, args, context) {
        // const url = `${config.services.settings}/api/institute/getInstituteDetails`;
        return controller.getAssets(args, context)
            .then(instituteDetails => instituteDetails).catch(err => err);
    },
};

export default { GetStudentAssets };
