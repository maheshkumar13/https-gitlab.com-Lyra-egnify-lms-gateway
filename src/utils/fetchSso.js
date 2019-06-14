/* eslint-disable no-param-reassign */
import fetch from 'universal-fetch';

export default function (url, params, context) {
  params.headers = context.token || {};
  params.headers['Content-Type'] = 'application/json';
  return fetch(url, params);
}
