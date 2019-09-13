import {
  GraphQLString as StringType,
  GraphQLInputObjectType as InputType,
  GraphQLNonNull as NonNull,
  GraphQLEnumType as EnumType,
} from 'graphql';

const MediumEnumType = new EnumType({ // eslint-disable-line
  name: 'MediumEnumType',
  values: {
    web: {
      value: 'web',
    },
    app: {
      value: 'app',
    },
  },
});


export const TimeseriesInputType = new InputType({
  name: 'TimeseriesInputType',
  fields: {
    assetId: { type: new NonNull(StringType), description: 'Asset Id' },
    medium: { type: new NonNull(MediumEnumType), description: 'communication medium web/app' },
    entry: { type: new NonNull(StringType), description: 'entry time' },
    exit: { type: new NonNull(StringType), description: 'exit time' },
  },
});

export default {
  TimeseriesInputType,
};
