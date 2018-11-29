/**
@author  Bharath Vemula.
@data    XX/XX/2018
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  GraphQLList as List,
  // GraphQLFloat as FloatType,
  GraphQLInputObjectType as InputObjectType,
  // GraphQLEnumType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { FilterInputType } from '../ga/ga.type';

export const AllTestAvergareResultsType = new ObjectType({
  name: 'AllTestAvergareResultsType',
  description: 'Common Reports per Student',
  fields: {
    // student data
    studentId: { type: StringType, description: 'ID of the Student' },
    studentMetaData: { type: GraphQLJSON, description: 'Student Meta Data' },
    attendanceCount: { type: IntType, description: 'number of tests student have attempted' },
    name: { type: StringType, description: 'Name of the Student' },
    markAnalysis: { type: GraphQLJSON, description: 'Mark Analysis of an Invidual Student' },
    averageMarkAnalysis: { type: GraphQLJSON, description: 'average marks on the basis of selected tests' },
    rankAnalysis: { type: GraphQLJSON, description: 'rank Analysis based on average marks calculated for selected tests' },
  },
});

export const allTestResultsInputType = new InputObjectType({
  name: 'allTestResultsInputType',
  fields: {
    testIds: { type: new NonNull(new List(StringType)) },
    filter: { type: new List(FilterInputType) },
    testType: { type: new NonNull(StringType) },
    pageNumber: { type: IntType },
    limit: { type: IntType },
  },
});

export default { AllTestAvergareResultsType };
