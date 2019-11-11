/**
   @author Nikhil Kumar
   @date    07/11/2019
   @version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLString as StringType,
    GraphQLObjectType as ObjectType,
    GraphQLBoolean as BooleanType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import controller from '../../../api/settings/student/studentHeader.controller';
import { StudentHeaderType } from './studentHeader.type';

export const studentHeader = {
    args:{
        className: { type: new List(StringType) },
        branch: { type: new List(StringType) },
        country: { type: new List(StringType) },
        state: { type: new List(StringType) },
        city: { type: new List(StringType) },
        section: { type: new List(StringType) },
        orientation: { type: new List(StringType) },
    },
    type: GraphQLJSON,
    async resolve(obj, args, context) {
        try {
            const docs = await controller.getStudentHeader(args,context);
            return docs;
        } catch (err) {
            throw new Error("Internal Error");
        }
    },
};
export default {
studentHeader
};
