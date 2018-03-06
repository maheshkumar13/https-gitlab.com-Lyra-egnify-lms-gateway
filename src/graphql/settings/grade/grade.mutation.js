/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/
/* eslint max-len: 0 */
import {
  // GraphQLList as List,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import fetch from 'universal-fetch';

import { GradeType, PatternType, GradePatchType, PatternPatchType } from './grade.type';

/*
mutation ($patches:JSON!) {
createGradePattern(pattern:$patches) {
level
data
}
}

{
"patches":{"type":"overall","patternName":"C1","minMarks":50,"maxMarks":60,"remarks":"dsds","gradePoint":10,"systemName":"a", "systemCode":"a"}
}
*/

export const createGradePattern = {
  args: {
    input: { type: new NonNull(GraphQLJSON) },
  },
  type: PatternType,
  async resolve(obj, args) {
    const pattern = JSON.stringify(args.input);//eslint-disable-line
    // console.log(args);
    const url = 'http://localhost:5001/api/grade/create/pattern/';
    return fetch(url, { method: 'POST', body: pattern, headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};


export const createGradeSystem = {
  args: {
    input: { type: new NonNull(GraphQLJSON) },
  },
  type: GradeType,
  async resolve(obj, args) {
    // args.data = JSON.stringify(args.gradeSystem);//eslint-disable-line
    // console.log(args);
    const url = 'http://localhost:5001/api/grade/create/system';
    return fetch(url, { method: 'POST', body: JSON.stringify(args.input), headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const updateGradeSystem = {
  args: {
    input: { type: new NonNull(GradePatchType) },
  },
  type: GradeType,
  async resolve(obj, args) {
    // args.data = JSON.stringify(args.gradeSystem);//eslint-disable-line
    // console.log(args);
    const url = 'http://localhost:5001/api/grade/update/system';
    return fetch(url, { method: 'POST', body: JSON.stringify(args.input), headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const updateGradePattern = {
  args: {
    input: { type: new NonNull(PatternPatchType) },
  },
  type: PatternType,
  async resolve(obj, args) {
    // args.data = JSON.stringify(args.gradeSystem);//eslint-disable-line
    // console.log(args);
    const url = 'http://localhost:5001/api/grade/update/pattern';
    return fetch(url, { method: 'POST', body: JSON.stringify(args.input), headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .then(json => json)
      .catch((err) => {
        console.error(err);
      });
  },
};

export const removeGradeSystem = {
  args: {
    id: { type: new NonNull(StringType) },
  },
  type: BooleanType,
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/grade/delete/system/';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
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

export const removeGradePattern = {
  args: {
    id: { type: new NonNull(StringType) },
  },
  type: BooleanType,
  async resolve(obj, args) {
    const url = 'http://localhost:5001/api/grade/delete/pattern/';
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
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
  createGradeSystem,
  createGradePattern,
  removeGradeSystem,
  removeGradePattern,
  updateGradeSystem,
  updateGradePattern,
};
