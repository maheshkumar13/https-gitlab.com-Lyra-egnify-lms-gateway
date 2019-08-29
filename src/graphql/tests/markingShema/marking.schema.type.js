import {
    GraphQLObjectType as ObjectType,
    GraphQLString as StringType,
    GraphQLFloat as FloatType,
    GraphQLInt as IntType
} from 'graphql';

const EvalType = new ObjectType({
    name : "EvalType",
    fields:  {
        rightAnswer : {type : FloatType},
        wrongAnswer : {type : FloatType},
        unAttempted  : {type : FloatType}
    }
})


export const MarkingSchemaOutPut = new ObjectType({
    name : "MarkingSchemaOutPut",
    fields : {
        _id : {type : StringType},
        totalMarks : {type : FloatType},
        totalQuestions : {type : IntType},
        eval : {type : EvalType}
    }
})