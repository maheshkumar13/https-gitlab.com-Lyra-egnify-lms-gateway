/**
@author Rahul Islam
@date    XX/XX/XXXX
@version 1.0.0
*/

import {
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  // GraphQLNonNull as NonNull,
  // GraphQLInt as IntType,
} from 'graphql';


const TestPatternType = new ObjectType({
  name: 'TestPatternType',
  fields: {
    name: { type: StringType },
    patternCode: { type: StringType },
    code: { type: StringType },
    description: { type: StringType },
  },
});

export default TestPatternType;
