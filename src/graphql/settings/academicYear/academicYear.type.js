import {
  GraphQLObjectType as ObjectType,
  GraphQLStringType as StringType,
  // GraphQLNonNull as NonNull,
  GraphQLInputObjectType as InputType,
  // GraphQLInt as IntType,
  GraphQLEnumType as EnumType,
  GraphQLList as List,
  GraphQLBoolean as BooleanType,
} from 'graphql';

// import GraphQLJSON from 'graphql-type-json';

export const AcademicYearType = new ObjectType({
  name: 'AcademicYearType',
  fields: () => ({
    academicYear: { type: StringType, description: 'Academic Year' },
    startDate: { type: StringType, description: 'Start Date of the Academic Year' },
    endDate: { type: StringType, description: 'End Date of the Academic Year' },
    isCurrent: { type: BooleanType, description: 'Boolean Describing if the it is current Academic Year or not' },
    institute: { type: StringType, description: 'Institute Name' },
    status: { type: StringType, description: 'Status of the Academic Year' },
  }),
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
    null: {
      value: null,
    },
  },
});


export const AcademicYearInputType = new InputType({
  name: 'AcademicYearInputType',
  fields: {
    academicYear: { type: new List(StringType), description: 'Academic Year' },
    isCurrent: { type: BooleanType, description: 'Boolean Describing if the it is current Academic Year or not' },
  //  institute: { type: new List(StringType), description: 'Institute Name' },
  //  status: { type: new List(AcademicYearStatusEnumType), description: 'Status of the Academic Year' },
  },
});

export default { AcademicYearType, AcademicYearInputType };
