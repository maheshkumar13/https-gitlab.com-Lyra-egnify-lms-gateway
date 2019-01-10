/**
   @author KSSR
   @date    09/01/2019
   @version 1.0.0
*/

import { GraphQLNonNull as NonNull } from 'graphql';

import fetch from '../../../utils/fetch';
import { config } from '../../../config/environment';
import {
  InputRetakeTestType,
  InputUpdateRetakeTestType,
  InputMoveRetakeTestType,
  RetakeTestType,
  MoveRetakeTestType,
} from './retakeTest.type';

export const createRetakeTest = {
  args: {
    input: { type: new NonNull(InputRetakeTestType) },
  },
  type: RetakeTestType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/retakeTest/create`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      });
  },
  description: 'Create test',
};

export const updateRetakeTest = {
  args: {
    input: { type: new NonNull(InputUpdateRetakeTestType) },
  },
  type: RetakeTestType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/retakeTest/update`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args.input),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message)); // eslint-disable-line
  },
  description: 'Defined fields get updated',
};

export const moveRetakeTest = {
  args: {
    input: { type: new NonNull(InputMoveRetakeTestType) },
  },

  type: MoveRetakeTestType,
  async resolve(obj, args, context) {
    const url = `${config.services.test}/api/v1/retakeTest/moveTest`;
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(args),
      headers: { 'Content-Type': 'application/json' },//eslint-disable-line
    }, context)
      .then((response) => {
        if (response.status >= 400) {
          return new Error(response.statusText);
        }
        return response.json();
      })
      .catch(err => new Error(err.message));
  },
};

export default {
  createRetakeTest,
  updateRetakeTest,
  moveRetakeTest,
};
