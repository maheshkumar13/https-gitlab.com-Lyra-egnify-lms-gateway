import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
  GraphQLInt as IntType,
  // GraphQLList as List,
  // GraphQLFloat as FloatType,
  // GraphQLInputObjectType as InputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { QuestionMappingsDataType } from '../questionMapping/questionMapping.type';

export const BehaviourDataType = new ObjectType({
  name: 'BehaviourDataType',
  description: 'Question Wise Behavior data for a student',
  fields: {
    // student data
    questionNumber: { type: IntType, description: 'question Number' },
    subject: { type: StringType, description: 'name of the subject' },
    status: { type: StringType, description: 'question status C/W/U/P' },
    enterStatus: { type: BooleanType, description: 'collean variable to know if student has viewed the question atlkeast for once' },
    qMap: { type: QuestionMappingsDataType, description: 'question mapping type' },
    marks: { type: IntType, description: 'marks attained for the question' },
    lastAttempted: { type: GraphQLJSON },
  },
});

export default { BehaviourDataType };
