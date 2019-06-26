import { getModel as StudentModel } from '../../settings/student/student.model'

import { config } from '../../../config/environment';

const crypto = require('crypto')


function getStudentQuery(args) {
  const query = { active: true }
      if (args.class) {
        console.log(args.class);
        query['hierarchyLevels.L_2'] = args.class;
      }
      return query;
};
  
  export async function getOrientations(args , context){
    if(!args.class){
      throw new Error('Insufficient data');
    }
    
    const query = getStudentQuery(args);
    console.log(query);
    return StudentModel(context).then( (Students) => {
      console.log(query);
      
        return Students.distinct('orientation' , query);
      })
  }
  
  export async function getBranches(args , context){
    if(!args.class){
      throw new Error('Insufficient data');
    }
    
    const query = getStudentQuery(args);
    console.log(query);
    return StudentModel(context).then( (Students) => {
      console.log(query);
      
        return Students.distinct('hierarchyLevels.L_5' , query);
      })
  }

  