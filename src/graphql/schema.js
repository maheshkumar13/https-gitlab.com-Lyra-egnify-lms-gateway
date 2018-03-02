/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import GradeSystem from './settings/grade/grade.query';
import TestPattern from './settings/testPattern/testPattern.query';
import Curriculum from './settings/curriculum/curriculum.query';
import InstituteHierarchy from './settings/instituteHierarchy/instituteHierarchy.query';
import InstituteHierarchyGrid from './settings/instituteHierarchy/instituteHierarchyGrid.query';
import { CreateInstituteHierarchyNode, UpdateInstituteHierarchyNode } from './settings/instituteHierarchy/instituteHierarchy.muatation';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      GradeSystem,
      TestPattern,
      Curriculum,
      InstituteHierarchy,
      InstituteHierarchyGrid,
    },
  }),
  mutation: new ObjectType({
    name: 'Mutation',
    fields: {
      CreateInstituteHierarchyNode,
      UpdateInstituteHierarchyNode,
    },
  }),
});

export default schema;
