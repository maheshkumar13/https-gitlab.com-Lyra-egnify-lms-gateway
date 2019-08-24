import {
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType
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

export default {
    ListInputType
}