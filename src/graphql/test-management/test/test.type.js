/**
@author Aslam Shaik
@data    14/03/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

// const GraphQLStringType = require('graphql-StringType');

const TestType = new ObjectType({
  name: 'TestType',
  fields: {
      testId: { type: StringType },
      testName: { type: StringType },
      testType: { type: StringType },
      totalMarks:{type: IntType},
      StringType: { type: StringType },
      startTiime:{type: StringType},
      duration: {type: IntType},
      curriculum:{type: StringType},
      subject:{type: GraphQLJSON },
      hierarchy:{type: GraphQLJSON },
      conceptTaxonomy:{type: GraphQLJSON },
      creationMetadata:{type: GraphQLJSON },
      questionTypes:{type: GraphQLJSON },
      markingSchema:{type: GraphQLJSON },
      Qmap:{type: GraphQLJSON },
      campuses: {type:IntType},
      resultsUploaded: {type: StringType},
      resultsUploadedPercentage: {type: IntType},
      stepsCompleted:{ type: IntType },
      totalSteps:{type: IntType },
      status:{type: StringType,},
      active: { type: BooleanType },
  },
});

export default TestType;
