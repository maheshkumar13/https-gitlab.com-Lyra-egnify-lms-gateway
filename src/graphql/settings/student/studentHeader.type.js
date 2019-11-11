/**
@author Nikhil Kumar
@data    07/11/2019
@version 1.0.0
*/

import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
    GraphQLInt as IntType,
    GraphQLList as List,

    // GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { StudentType } from './student.type';

// const GraphQLDate = require('graphql-date');

export const StudentHeaderType = new ObjectType({
    name: 'StudentHeaderType',
    fields: {
        className: { type: new List(StringType) },
        branch: { type: new List(StringType) },
        country: { type: new List(StringType) },
        state: { type: new List(StringType) }, 
        city: { type: new List(StringType) },
        section: { type: new List(StringType) },
        orientation: { type: new List(StringType) },
    },
});

export default {
    StudentHeaderType
};
