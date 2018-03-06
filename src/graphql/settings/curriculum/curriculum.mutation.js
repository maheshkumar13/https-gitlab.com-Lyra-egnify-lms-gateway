/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';

import CurriculumType from './curriculum.type';

export const createCurriculum = {
  args: {
    curriculumList: { type: GraphQLJSON },
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


export const createSubjects = {
  args: {
    data: { type: GraphQLJSON },
  },
  type: new List(CurriculumType),
  async resolve(obj, args) {
    args.data = JSON.stringify(args.data);//eslint-disable-line
    // console.log(args);
    const url = 'http://localhost:5001/api/subjectTaxonomy/saveSubject';
    return fetch(url, { method: 'POST', body: JSON.stringify(args), headers: { 'Content-Type': 'application/json' } })
      .then(response => response.json())
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const removeSubjectTaxonomy = {
  args: {
    code: { type: new NonNull(StringType) },
  },
  type: CurriculumType,
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/subjectTaxonomy/delete/'.concat(args.code);
    return fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then(response => response.json())
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};

export const updateSubjectTaxonomy = {
  args: {
    code: { type: new NonNull(StringType) },
    name: { type: StringType },
    subCode: { type: StringType },
  },
  type: CurriculumType,
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/subjectTaxonomy/update/'.concat(args.code);
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then(response => response.json())
      .then(json =>
        // console.log(json);
        json)
      .catch((err) => {
        console.error(err);
        return err.json();
      })
      .catch((errjson) => {//eslint-disable-line
        // console.log(errjson);
      });
  },
};


export default {
  createCurriculum,
  createSubjects,
  removeSubjectTaxonomy,
  updateSubjectTaxonomy,
};
