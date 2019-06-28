/**
@author Sarvagya Bhargava
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
    GraphQLList as List,
    GraphQLObjectType as ObjectType,
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLID as ID,
    GraphQLBoolean as BooleanType,    
    GraphQLEnumType as EnumType,
    isOutputType
  } from 'graphql';


  import {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime
  } from 'graphql-iso-date';
  
  import GraphQLJSON from 'graphql-type-json';

  import {TestPatternType , TestPatternInputType} from '../../settings/testPattern/testPattern.type';

  const PaperEnumType = new EnumType({
    name: 'PaperEnumType',
    values: {
      ExamLevel: {
        value: "ExamLevel",
      },
      MediumLevel: {
        value: "MediumLevel",
      },
      ShortLevel: {
        value: "ShortLevel",
      },
    },
  });

  export const TestType = new ObjectType({
    name : 'TestType',
    fields : {
      name: { type: new NonNull(StringType), description: 'Name of the test' },
      testId : {type : new NonNull(StringType) , description : 'testCode'},
      class: {type : new NonNull(StringType) , description : 'Name of the class'},
      classCode: { type: new NonNull(StringType), description: 'classCode of class' },
      startTime: { type: GraphQLDate, description: 'Start time of test' },
      Type: { type: StringType, description: 'Based on length of test' },
      avgPaperTime:{ type: StringType, description: 'avgtime on type of data' },
      date: { type: StringType, description: 'Date of test'},
      duration: { type: StringType, description: 'Duration of test'},
      testPattern : {type : TestPatternType , description : 'Marking Schema'},
      active : {type : BooleanType},
      questionPaperId : {type : StringType}
    }
  })

  export const TestInputType = new InputType({
    name: 'TestInputType',
    fields: {
      name: { type: new NonNull(StringType), description: 'Name of the test' },
      class: { type: new NonNull(StringType), description: 'name of the class' },
      time: { type: StringType, description: 'Start time of the test' },
      Type: { type: StringType, description: 'Based on length of test' },
      avgPaperTime:{ type: new NonNull(PaperEnumType) },
      date: { type: StringType, description: 'Date of test'},
      duration: { type: (StringType), description: 'Duration of test'},
      testPattern : {type : TestPatternInputType , description : 'Marking Schema'},
      questionPaperId : {type : StringType}
    }
  })
  
  
  
  export default {
    TestInputType,
    TestType,
  };
