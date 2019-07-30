/**
   @description GraphQl queries for testtypes.
   @author Aditi
   @date   10/07/2019
*/
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

import {nameCodeType} from '../textbook/textbook.type'
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
    subjects :{type : new NonNull(new List(StringType)), description :'list of subject codes' }
  }
});

export const OutputTestType = new ObjectType({
  name: 'OutputTestType',
  fields: {
    name: { type: StringType, description: 'Name of the test type created' },
    code: { type: StringType, description: 'Internal code of the test type' },
    class:{ type : nameCodeType},
    educationType:{type:StringType},
    subjects:{type:new List(nameCodeType)}
  },
});
  
export const UpdateTestTypeInputType = new InputType({
  name: 'UpdateTestTypeInputType',
  fields: {
    name: { type: StringType, description: 'Name of the test type' },
    educationType:{type: EduType},
    code: { type: new NonNull(StringType), description: 'Internal code of testtype' },
    subjects:{type : new List(StringType), description :'list of subject codes' },
    classCode :{type: StringType, description: 'to update class, class code of new class'}
  }
});


export default {
  CreateTestTypeInputType, 
  OutputTestType, 
  UpdateTestTypeInputType,
};