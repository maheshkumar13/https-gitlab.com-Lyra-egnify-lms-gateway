import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLBoolean as BooleanType,
    GraphQLInt as IntType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';



export const StudentListType = new ObjectType({
    name: 'StudentListType',
    fields: {
        egnifyId: { type: StringType },
        studentId: { type: StringType },
        studentName: { type: StringType },
        fatherName: { type: StringType },
        gender: { type: StringType },
        dob: { type: StringType },
        category: { type: StringType },
        hierarchy: { type: GraphQLJSON },
        userCreated: { type: BooleanType },
        hierarchyLevels: { type: GraphQLJSON },
        orientation: { type: StringType },
        phone: { type: StringType },
    },
});

export default {
    StudentListType,
    
};
