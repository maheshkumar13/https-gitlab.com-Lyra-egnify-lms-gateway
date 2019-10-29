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

// import GraphQLJSON from 'graphql-type-json';

export const AssetsType = new ObjectType({
    name: 'AssetsType',
    fields: {
        studentId: { type: StringType },
        studentName: { type: StringType },
    },
});

export default { AssetsType, };
