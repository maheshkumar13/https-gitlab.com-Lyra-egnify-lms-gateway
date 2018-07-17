import {
  GraphQLList as List,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  GraphQLNonNull as NonNull,
  GraphQLInt as IntType,
} from 'graphql';
import { config } from '../../../config/environment';
import fetch from '../../../utils/fetch';


const anscetors = new ObjectType({
  name: 'AnscetorsType',
  fields: {
    child: { type: StringType },
    childCode: { type: StringType },
    parent: { type: StringType },
    parentCode: { type: StringType },
    level: { type: IntType },
    levelName: { type: IntType },
  },
});

const InstituteHierarchyType = new ObjectType({
  name: 'InstituteHierarchyTree',
  fields: () => ({
    child: { type: new NonNull(StringType) },
    childCode: { type: new NonNull(StringType) },
    parent: { type: StringType },
    parentCode: { type: StringType },
    level: { type: IntType },
    levelName: { type: StringType },
    isLeafNode: { type: BooleanType },
    anscetors: { type: new List(anscetors) },
    description: { type: StringType },
    next: {
      type: new List(InstituteHierarchyType),
      async resolve(obj, args, context) {
        const filters = {};
        const url = `${config.services.settings}/api/instituteHierarchy/filter/nodes`;
        filters.parentCode = obj.childCode;
        return fetch(url, {
          method: 'POST',
          body: JSON.stringify({ filters: JSON.stringify(filters) }),
          headers: { 'Content-Type': 'application/json' },
        }, context)
          .then(response => response.json())
          .then(json => json)
          .catch((err) => {
            console.error(err);
          });
      },
    },
  }),
});


export default InstituteHierarchyType;
