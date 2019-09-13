
/**
 @description GraphQl queries for Institute time series.

 @author Aslam
 @date   20/08/2019
 @version 1.0.0
*/

import {
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
} from 'graphql';

import { TimeseriesInputType } from './timeseries.type';

const controller = require('../../../api/analysis/timeseries/timeseries.controller');


export const addTimeseries = {
  args: {
    input: { type: new NonNull(TimeseriesInputType), description: 'Input type for time series' },
  },
  type: StringType,
  async resolve(obj, args, context) {
    return controller.addTimeseries(args.input, context);
  },
};

export default {
  addTimeseries,
};
