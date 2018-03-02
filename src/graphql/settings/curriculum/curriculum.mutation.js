/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';

import CurriculumType from './curriculum.type';

const createCurriculum = {
  args: {
    curriculumList: { type: GraphQLJSON },
    dumb: { type: StringType },
  },
  type: new List(CurriculumType),
  async resolve(obj, args) {
    args.curriculumList = JSON.stringify(args.curriculumList);//eslint-disable-line
    // console.log(args);
    const url = 'http://localhost:5001/api/subjectTaxonomy/create/curriculum';
    return fetch(url, { method: 'POST', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' } })
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export default createCurriculum;
