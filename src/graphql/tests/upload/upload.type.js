import {
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType
} from 'graphql';

export const ListInputType = new InputType({
    name: 'ListInputType',
    fields: {
        class_code : { type : StringType },
        textbook_code : { type : StringType},
        subject_code : { type : StringType },
        search_query : { type : StringType },
        sort_order : { type : StringType }
    }
});

export const TestUploadInputType = new InputType({
    name : "TestUploadInputType",
    fields: {
        class_code : { type : NonNull(StringType) },
        class_name : { type : NonNull(StringType) },
        subject_name : { type : NonNull(StringType) },
        subject_code : { type : NonNull(StringType) },
        textbook_name : { type : NonNull(StringType) },
        textbook_code : { type : NonNull(StringType) },
        test_name : { type : NonNull(StringType) },
        test_date : { type : NonNull(StringType) },
        test_duration : { type : NonNull(IntType) },
        file_key : { type : NonNull(StringType) },
        marking_schema : { type : NonNull(StringType) },
        start_time : { type : NonNull(StringType) },
        end_time : { type : NonNull(StringType) }
    }
});