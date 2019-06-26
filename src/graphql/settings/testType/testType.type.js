
import {
    GraphQLList as List,
    GraphQLObjectType as ObjectType,
    GraphQLInputObjectType as InputType,
    GraphQLString as StringType,
    GraphQLNonNull as NonNull,
    GraphQLInt as IntType,
    GraphQLBoolean as BooleanType,
    GraphQLEnumType as EnumType
    
  } from 'graphql';

import GraphQLJSON from 'graphql-type-json';
const eduData = ['School/College','Competitive'];

export const EduType = new EnumType({
  name : 'EduType',
  values: {
    SCHOOLCOLLEGE :{ 
      value: "School/College"
    },
    COMPETITIVE : {
      value: "Competitve"
    }
  },
});

export const CreateTestTypeInputType = new InputType({
  name: 'TestInputType',
  fields: {
    name: { type: new NonNull(StringType), description: 'Name of the test type' },
    classCode: { type: new NonNull(StringType), description: 'childCode of class' },
    educationType: { type: new NonNull(EduType), description: 'education type' },
    subjects :{type : new List(StringType), description :'list of subject codes' }
  }
});
export const namecodeType = new ObjectType({
  name: 'namecodeType',
  fields:{
    name:{type: StringType},
    code:{type:StringType}
  }
})

export const OutputTestType = new ObjectType({
  name: 'OutputTestType',
  fields: {
    name: { type: StringType, description: 'Name of the test type created' },
    code: { type: StringType, description: 'Internal code of the test type' },
    class:{ type : namecodeType},
    educationType:{type:StringType},
    subjects:{type:new List(namecodeType)}
    // subjects :{ type: new List(namecodeType)},
  },
});
  
export const updateTestTypeInputType = new InputType({
  name: 'updateTestTypeInputType',
  fields: {
    name: { type: StringType, description: 'Name of the test type' },
    educationType:{type: EduType},
    code: { type: new NonNull(StringType), description: 'Internal code of testtype' },
    subjects:{type : new List(StringType), description :'list of subject codes' }
  }
});


export default {
  CreateTestTypeInputType, 
  OutputTestType, 
  updateTestTypeInputType,
};