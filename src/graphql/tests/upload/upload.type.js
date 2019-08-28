import {
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLObjectType as ObjectType,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType
} from 'graphql';


export const ListInputType = new InputType({
    name: 'ListInputType',
    fields: {
        class_code: {
            type: StringType
        },
        textbook_code: {
            type: StringType
        },
        subject_code: {
            type: StringType
        },
        search_query: {
            type: StringType
        },
        sort_order: {
            type: StringType
        }
    }
});

export const TestUploadInputType = new InputType({
    name: "TestUploadInputType",
    fields: {
        class_code: {
            type: NonNull(StringType)
        },
        class_name: {
            type: NonNull(StringType)
        },
        subject_name: {
            type: NonNull(StringType)
        },
        subject_code: {
            type: NonNull(StringType)
        },
        textbook_name: {
            type: NonNull(StringType)
        },
        textbook_code: {
            type: NonNull(StringType)
        },
        test_name: {
            type: NonNull(StringType)
        },
        test_date: {
            type: NonNull(StringType)
        },
        test_duration: {
            type: NonNull(IntType)
        },
        file_key: {
            type: NonNull(StringType)
        },
        marking_schema: {
            type: NonNull(StringType)
        },
        start_time: {
            type: NonNull(StringType)
        },
        end_time: {
            type: NonNull(StringType)
        }
    }
});

export const TestUpdateInputType = new InputType({
    name: "TestUpdateInputType",
    fields: {
        id : {
            type : NonNull(StringType)
        },
        class_code: {
            type: NonNull(StringType)
        },
        class_name: {
            type: NonNull(StringType)
        },
        subject_name: {
            type: NonNull(StringType)
        },
        subject_code: {
            type: NonNull(StringType)
        },
        textbook_name: {
            type: NonNull(StringType)
        },
        textbook_code: {
            type: NonNull(StringType)
        },
        test_name: {
            type: NonNull(StringType)
        },
        test_date: {
            type: NonNull(StringType)
        },
        test_duration: {
            type: NonNull(IntType)
        },
        marking_schema: {
            type: NonNull(StringType)
        },
        start_time: {
            type: NonNull(StringType)
        },
        end_time: {
            type: NonNull(StringType)
        }
    }
});

const TestInfo = new ObjectType({
    name: "TestInfo",
    fields: {
        _id: {
            type: StringType
        },
        name: {
            type: StringType
        },
        start_time: {
            type: StringType
        },
        end_time: {
            type: StringType
        },
        date: {
            type: StringType
        },
        duration: {
            type: IntType
        }
    }
})

const CommonData = new ObjectType({
    name: "CommonData",
    fields: {
        code: {
            type: StringType
        },
        name: {
            type: StringType
        }
    }
})
const Mapping = new ObjectType({
    name: "Mapping",
    fields: {
        _id: {
            type: StringType
        },
        textbook: {
            type: CommonData
        },
        subject: {
            type: CommonData
        },
        class: {
            type: CommonData
        },
    }
})

const Data = new ObjectType({
    name: "Data",
    fields: {
        active: {
            type: BooleanType
        },
        file_key: {
            type: StringType
        },
        _id: {
            type: StringType
        },
        marking_scheme: {
            type: StringType
        },
        created_at: {
            type: StringType
        },
        updated_at: {
            type: StringType
        },
        test: {
            type: TestInfo
        },
        mapping: {
            type: Mapping
        }
    }
})

export const ListTestOutput = new ObjectType({
    name: "ListTestOutput",
    fields: {
        total: {
            type: IntType,
            description: "Total tests created."
        },
        data: {
            type: new ListType(Data),
            description: "List of tests"
        }
    }
})