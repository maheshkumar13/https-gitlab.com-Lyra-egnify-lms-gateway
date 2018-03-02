/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
} from 'graphql';


const TestPatternType = new ObjectType({
  name: 'TestPatternType',
  fields: {
    name: { type: new NonNull(StringType) },
    patternCode: { type: new NonNull(StringType) },
    code: { type: StringType },
    description: { type: StringType },
  },
});

export default TestPatternType;
