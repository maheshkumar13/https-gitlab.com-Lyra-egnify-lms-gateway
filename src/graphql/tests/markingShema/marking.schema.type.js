import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLFloat as FloatType,
    GraphQLInt as IntType
} from 'graphql';

const EvalType = new ObjectType({
    name : "EvalType",
    fields:  {
        right_answer : {type : FloatType},
        wrong_answer : {type : FloatType},
        unattempted  : {type : FloatType}
    }
})


export const MarkingSchemaOutPut = new ObjectType({
    name : "MarkingSchemaOutPut",
    fields : {
        _id : {type : StringType},
        total_marks : {type : FloatType},
        total_questions : {type : IntType},
        eval : {type : EvalType}
    }
})