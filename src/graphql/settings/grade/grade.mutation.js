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

import { config } from '../../../config/environment';
import { GradeType, PatternType, GradePatchType, PatternPatchType } from './grade.type';
import fetch from '../../../utils/fetch';


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
  async resolve(obj, args, context) {
    const pattern = JSON.stringify(args.input);//eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/grade/create/pattern/`;
    return fetch(url, { method: 'POST', body: pattern, headers: { 'Content-Type': 'application/json' } }, context)
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
  async resolve(obj, args, context) {
    // args.data = JSON.stringify(args.gradeSystem);//eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/grade/create/system`;
    return fetch(url, { method: 'POST', body: JSON.stringify(args.input), headers: { 'Content-Type': 'application/json' } }, context)
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
  async resolve(obj, args, context) {
    // args.data = JSON.stringify(args.gradeSystem);//eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/grade/update/system`;
    return fetch(url, { method: 'POST', body: JSON.stringify(args.input), headers: { 'Content-Type': 'application/json' } }, context)
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
  async resolve(obj, args, context) {
    // args.data = JSON.stringify(args.gradeSystem);//eslint-disable-line
    // console.log(args);
    const url = `${config.services.settings}/api/grade/update/pattern`;
    return fetch(url, { method: 'POST', body: JSON.stringify(args.input), headers: { 'Content-Type': 'application/json' } }, context)
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
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/grade/delete/system/`;
    return fetch(
      url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      },
      context,
    )
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.statusText;
      })
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
  type: StringType,
  async resolve(obj, args, context) {
    const url = `${config.services.settings}/api/grade/delete/pattern/`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.statusText;
      })
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
