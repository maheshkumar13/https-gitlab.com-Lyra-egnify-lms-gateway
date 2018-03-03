/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

const SubjectType = new ObjectType({
  name: 'SubjectType',
  fields: {
    sno: { type: IntType },
    subject: { type: StringType },
    subjectCode: { type: StringType },
    code: { type: StringType },
    subSubjectCode: { type: StringType },
    subSubjectList: { type: GraphQLJSON },
  },
});

const CurriculumType = new ObjectType({
  name: 'CurriculumType',
  fields: {
    level: { type: new NonNull(StringType) },
    nextLevel: { type: new NonNull(StringType) },
    code: { type: StringType },
    parent: { type: StringType },
    child: { type: StringType },
    subCode: { type: StringType },
    subject: {
      // args: {
      //   type: { type: new NonNull(PatternEnumType) },
      //   parent: { type: StringType },
      // },
      type: new List(SubjectType),
      async resolve(obj) {
        const url = 'http://localhost:5001/api/subjectTaxonomy/curriculum/'.concat(obj.code);
        return fetch(url, { method: 'GET' })
          .then(response => response.json())
          .then(json => json.subjectList)
          .catch((err) => {
            console.error(err);
          });
      },
    },
  },
});

export default CurriculumType;
