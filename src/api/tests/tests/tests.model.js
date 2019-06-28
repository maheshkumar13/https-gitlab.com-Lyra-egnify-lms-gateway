/**
 *@description
 *    This File contains the Mongoose Schema defined for markingschema
 * @author
 *   Sarvagya
 * @date
 *    XX/XX/2019
 */

import mongoose from 'mongoose';
import { getDB } from '../../../db';
import { OBJECT_FIELD } from 'graphql/language/kinds';
import {TestPatternSchema} from '../../settings/testPattern/testPattern.model';

const tests = new mongoose.Schema(
    {
      name: { type: String},
      testId : {type : String},
      class: {type : String},
      classCode: { type: String},
      startTime: { type: Date},
      Type: { type: String},
      avgPaperTime:{ type: String},
      date: { type: String},
      duration: { type: String},
      testPattern : {type : TestPatternSchema},
      active : {type : Boolean , default : true},
      questionPaperId : {type : String}
    },
    {
      collection: 'tests',
  
    },
  );

  export async function getModel(userCxt) {
    const { instituteId } = userCxt;
    const db = await getDB(instituteId);
    return db.model('tests', tests);
  }
  
  export default{
    getModel,
  };