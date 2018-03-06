/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLInputObjectType as InputObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLEnumType,
  // GraphQLInt as IntType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

const PatternEnumType = new GraphQLEnumType({
  name: 'PatternEnumType',
  values: {
    overall: {
      value: 0,
    },
    subject: {
      value: 1,
    },
    all: {
      value: 2,
    },
  },
});

export const PatternPatchType = new InputObjectType({
  name: 'PatternPatchType',
  fields: {
    _id: { type: new NonNull(StringType) },
    patch: { type: GraphQLJSON },
  },
});

export const GradePatchType = new InputObjectType({
  name: 'GradePatchType',
  fields: {
    _id: { type: new NonNull(StringType) },
    patch: { type: GraphQLJSON },
  },
});

export const PatternType = new ObjectType({
  name: 'PatternType',
  fields: {
    _id: { type: new NonNull(StringType) },
    level: { type: new NonNull(StringType) },
    nextLevel: { type: new NonNull(StringType) },
    parent: { type: new NonNull(StringType) },
    data: { type: GraphQLJSON },
  },
});

export const GradeType = new ObjectType({
  name: 'GradeType',
  fields: {
    _id: { type: new NonNull(StringType) },
    level: { type: new NonNull(StringType) },
    nextLevel: { type: new NonNull(StringType) },
    parent: { type: new NonNull(StringType) },

    data: { type: GraphQLJSON },

    pattern: {
      args: {
        type: { type: new NonNull(PatternEnumType) },
      },
      type: new List(PatternType),
      async resolve(obj, args) {
        const url = 'http://localhost:5001/api/grade/read/pattern/';
        return fetch(url, {
          method: 'POST',
          body: JSON.stringify({ parent: obj.data.systemCode, type: args.type }),
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => response.json())
          .catch((err) => {
            console.error(err);
          });
      },
    },
  },
});

export default {
  GradeType,
  PatternType,
  PatternPatchType,
  GradePatchType,
};
