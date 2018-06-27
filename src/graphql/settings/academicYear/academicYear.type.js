import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLInputObjectType as InputType,
  // GraphQLInt as IntType,
  GraphQLList as List,
  GraphQLBoolean as BooleanType,
  GraphQLEnumType as EnumType,

} from 'graphql';


export const AcademicYearType = new ObjectType({
  name: 'AcademicYearType',
  fields: {
    academicYear: { type: StringType, description: 'Academic Year' },
    startDate: { type: StringType, description: 'Start Date of the Academic Year' },
    endDate: { type: StringType, description: 'End Date of the Academic Year' },
    isCurrent: { type: BooleanType, description: 'Boolean Describing if the it is current Academic Year or not' },
    institute: { type: StringType, description: 'Institute Name' },
    status: { type: StringType, description: 'Status of the Academic Year' },
  },
});


const AcademicYearStatusEnumType = new EnumType({
  name: 'AcademicYearStatusEnumType',
  values: {
    completed: {
      value: 'completed',
    },
    current: {
      value: 'current',
    },
    upcomming: {
      value: 'upcomming',
    },
  },
});

export const AcademicYearInputType = new InputType({
  name: 'AcademicYearInputType',
  fields: {
    academicYear: { type: new List(StringType) },
    isCurrent: { type: BooleanType, description: 'Boolean Describing if the it is current Academic Year or not' },
    institute: { type: new List(StringType), description: 'Institute Name' },
    status: { type: new List(AcademicYearStatusEnumType), description: 'status of the academicYear' },
    date: { type: StringType, description: 'test date to get academicYear' },
  },
});
export default { AcademicYearType, AcademicYearInputType };
