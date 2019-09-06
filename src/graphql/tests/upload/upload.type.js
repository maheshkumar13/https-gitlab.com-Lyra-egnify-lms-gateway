import {
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLObjectType as ObjectType,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

export const ListInputType = new InputType({
    name: 'ListInputType',
    fields: {
        classCode: {
            type: StringType
        },
        textbookCode: {
            type: StringType
        },
        subjectCode: {
            type: StringType
        },
        searchQuery: {
            type: StringType
        },
        sortOrder: {
            type: StringType
        },
        pageNumber : {
            type : NonNull(IntType)
        },
        limit : {
            type : NonNull(IntType)
        },
        orientation : {
            type : StringType
        },
        branch : {
            type : StringType
        }
    }
});

export const TestUploadInputType = new InputType({
    name: "TestUploadInputType",
    fields: {
        classCode: {
            type: NonNull(StringType)
        },
        className: {
            type: NonNull(StringType)
        },
        subjectName: {
            type: NonNull(StringType)
        },
        subjectCode: {
            type: NonNull(StringType)
        },
        textbookName: {
            type: NonNull(StringType)
        },
        textbookCode: {
            type: NonNull(StringType)
        },
        testName: {
            type: NonNull(StringType)
        },
        testDate: {
            type: NonNull(StringType)
        },
        testDuration: {
            type: NonNull(IntType)
        },
        fileKey: {
            type: NonNull(StringType)
        },
        markingSchema: {
            type: NonNull(StringType)
        },
        startTime: {
            type: NonNull(StringType)
        },
        endTime: {
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
        classCode: {
            type: NonNull(StringType)
        },
        className: {
            type: NonNull(StringType)
        },
        subjectName: {
            type: NonNull(StringType)
        },
        subjectCode: {
            type: NonNull(StringType)
        },
        textbookName: {
            type: NonNull(StringType)
        },
        textbookCode: {
            type: NonNull(StringType)
        },
        testName: {
            type: NonNull(StringType)
        },
        testDate: {
            type: NonNull(StringType)
        },
        testDuration: {
            type: NonNull(IntType)
        },
        markingSchema: {
            type: NonNull(StringType)
        },
        startTime: {
            type: NonNull(StringType)
        },
        endTime: {
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
        startTime: {
            type: StringType
        },
        endTime: {
            type: StringType
        },
        date: {
            type: StringType
        },
        duration: {
            type: IntType
        },
        paperId : {
            type : StringType
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
        fileKey: {
            type: StringType
        },
        _id: {
            type: StringType
        },
        markingScheme: {
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
        },
        orientations : { type : new ListType(StringType) },
        branches : { type : new ListType(StringType)}
    }
})

export const ListTestOutput = new ObjectType({
    name: "ListTestOutput",
    fields: {
        pageInfo: {
            type: GraphQLJSON,
            description: "Page Info."
        },
        data: {
            type: new ListType(Data),
            description: "List of tests"
        }
    }
})