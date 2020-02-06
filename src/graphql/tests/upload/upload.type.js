import {
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLObjectType as ObjectType,
    GraphQLList as ListType,
    GraphQLBoolean as BooleanType,
    GraphQLEnumType as EnumType
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

export const ListInputType = new InputType({
    name: 'ListInputType',
    fields: {
        active: {
            type: BooleanType
        },
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
            type : IntType
        },
        limit : {
            type : IntType
        },
        orientation : {
            type : StringType
        },
        branch : {
            type : StringType
        },
        gaStatus : {
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
        questionPaperId : {
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
        chapter: {
            type: CommonData
        }
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
        viewOrder: {
            type: IntType
        },
        orientations : { type : new ListType(StringType) },
        branches : { type : new ListType(StringType)},
        testId : { type : StringType },
        coins : {type : IntType}
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

const TestHeaderEnumType = new EnumType({ // eslint-disable-line
    name: 'TestHeaderEnumType',
    values: {
        class: {
            value: 'class',
        },
        subject: {
            value: 'subject',
        },
        textbook: {
            value: 'textbook',
        },
        chapter: {
            value: 'chapter',
        },
    },
});

export const TestHeadersAssetCountInputType = new InputType({
    name: 'TestHeadersAssetCountInputType',
    fields: {
      classCode: { type: StringType, description: 'Code of the class' },
      subjectCode: { type: StringType, description: 'Code of the subject' },
      chapterCode: { type: StringType, description: 'Code of the chapter' },
      textbookCode: { type: StringType, description: 'Code of the textBook' },
      branch: { type: StringType, description: 'Branch name' },
      orientation: { type: StringType, description: 'Orientaion name' },
      header: { type: NonNull(TestHeaderEnumType), description: 'Header' }
    },
});

export const CmsTestStatsInputType = new InputType({
    name: 'CmsTestStatsInputType',
    fields: {
      classCode: { type: StringType, description: 'Code of the class' },
      subjectCode: { type: StringType, description: 'Code of the subject' },
      chapterCode: { type: StringType, description: 'Code of the chapter' },
      textbookCode: { type: StringType, description: 'Code of the textBook' },
      branch: { type: StringType, description: 'Branch name' },
      orientation: { type: StringType, description: 'Orientaion name' },
      gaStatus: {type: BooleanType, description: "filter for ga"}
    },
  });
  
  export const CmsTestStatsOutputType = new ObjectType({
    name: 'CmsTestStatsOutputType',
    fields: {
      classCode: { type: StringType, description: 'Class code' },
      category: { type: StringType, description: 'Name of the category' },
      count: { type: IntType, description: 'Count of the files which belongs to that category' },
    },
  });