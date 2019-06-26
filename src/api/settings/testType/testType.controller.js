/**
 * @Author :Aditi
 * @date
 */

import { getModel as TestTypeModel } from './testType.model';
import { config } from '../../../config/environment';
import { getModel as InstituteHierarchyModel} from '../instituteHierarchy/instituteHierarchy.model'
import { getModel as CounterModel} from '../Counter/counter.model';
import {getModel as SubjectModel} from '../subject/subject.model'
import { valueFromAST } from 'graphql';

async function getHierarchyData(context, hierarchyCodes){
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    const query = {
      active: true,
      childCode: {
        $in: hierarchyCodes
      }
    }
    const projection = {
      _id: 0,
      child: 1,
      childCode: 1,
      parentCode: 1,
      levelName: 1
    }
    return InstituteHierarchy.find(query, projection)
  });
}

// async function getNextCount(context){
//   return TestTypeModel(context).then((TestType) => {
//     const query= [ {
//         $count : "count"
//     }]
//     return  TestType.aggregate(query)
//   })
// }


async function validateTestType(args, context){
  const query = {
    active: true,
    name: args.name,
    'classCode': args.classCode,
    'educationType': args.educationType,
  }
  return TestTypeModel(context).then((TestType) => {
    return TestType.findOne(query).then((obj) => {
      if (obj) return true
      return false
    });
  });
}

export async function createTestType(args, context){

  args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
  if (
      !args.name ||
      !args.classCode ||
      !args.educationType||
      !args.subjects||
      (args.subjects).length <1
  ){
    throw new Error('Insufficient data');
  }
    
  return validateTestType(args, context).then((isTestTypeExist) => {
      if(isTestTypeExist) throw new Error('TestType already exists')
      return Promise.all([
      getHierarchyData(context, [args.classCode]),
      TestTypeModel(context),
      CounterModel(context)
  ]).then(([
    hierarchyData,
    TestType,
    Counter]) => {
        var nextCount2 = 0;
        const classData = hierarchyData.find( x => x.levelName === 'Class' && x.childCode === args.classCode);
        if(
        !classData 
        ){
          throw new Error('Invalid input codes ')
        }
    const params = { counter: 'testtypecounter', value: 1}
    return Counter.getNext(params).then((next)=>{
      next = String(next["value"]["sequence_value"])
      console.log(next)
      const obj = {
        name: args.name,
        code: 'T' + ('000' + String(next)).substr(-3),
        classCode : args.classCode,
        educationType : args.educationType,
        subjects : args.subjects
        }
    return TestType.create(obj)
      }); 
    });
  });
};

function getTestTypeQuery(args){
   const query = { active: true }
   if (args.classCode) query['classCode'] = args.classCode;
   if (args.educationType) query['educationType'] = args.educationType;
   return query;
 };

export async function getTestType(args, context){
   const query = getTestTypeQuery(args)
   console.log(query);
   return TestTypeModel(context).then( (TestType) => {
     const project = {
       name: 1,
       code: 1,
       classCode :1,
       educationType:1,
       subjects:1
     }
     return TestType.find(query,project).then((testList)=>{
      return InstituteHierarchyModel(context).then((InstituteHierarchy)=>{
        var subs = []
        for(var value in testList){
          subs = subs.concat(testList[value]['subjects']) 
        }
        return SubjectModel(context).then((subjects) =>{
          var query ={
            code : {$in:subs}
          }
          return subjects.find(query,{subject:1,code:1, _id:0}).then((subjectList)=>{
          return InstituteHierarchy.find({levelName:"Class"},{childCode:1,child:1}).then((classList)=>{
            var resObj = [] ;
            for(var i = 0 ; i < testList.length; i++){
              const tempTestType = testList[i];
            var obj = {};
            var tempClassObj = classList.find(x=>x.childCode === tempTestType.classCode);
            obj['name']  = tempTestType.name;
            obj['code']  = tempTestType.code;
            obj['educationType']= tempTestType.educationType;
            obj['class'] = {
            name : (tempClassObj && tempClassObj.child) ? tempClassObj.child : null,
            code :  tempTestType.classCode
            }
            obj['subjects'] = []
            for(var j in tempTestType['subjects']){
              var sub ={};
              var tempSubType = tempTestType['subjects'][j]
              var tempSubObj = subjectList.find(x=>x['code'] === tempSubType);
              if(tempSubObj)
              {
                sub['name'] = tempSubObj.subject
                sub['code'] = tempSubType
              }
              obj['subjects'][j] = sub
            }

            resObj[i] = obj
            }
            return resObj ;
          })
         })
       })
      })
     });
   });
 }

export async function deleteTestType(args, context) {
  if (!args.code) throw new Error('Code is required')
  return TestTypeModel(context).then((TestType) => {
    const query = { active: true, code: args.code }
    const patch = { active: false}
    return TestType.findOneAndUpdate(query,patch).then((doc) => {
      if(!doc) throw new Error('TestType not found with given code')
      return doc ;
    });
  });
}

export async function validateTestTypeForUpdate(args, context){
  let query = {
    active: true,
    code: args.code,
  }
  return TestTypeModel(context).then((TestType) => {
    return TestType.findOne(query).then((obj) => {
      if (!obj) throw new Error('TestType not found with given code')
      if(args.name) {
        obj.name = args.name
      }
      if(args.classCode){
        obj.classCode  = args.classCode
      }
      if(args.educationType){
        obj.educationType  = args.educationType
      }
      if(args.subjects){
        obj.subjects = args.subjects
      }
      // return validateTestType(obj,context).then((isTestTypeExist)=>{
      //   if(isTestTypeExist) throw new Error('TestType already exists')
      //   return  TestType 
    // });
    console.log(obj)
    return TestTypeModel(context).then((validTestType) => {
      return validTestType.findOne(obj).then((exists) => {
        if (exists) throw new Error('Already exists, no edits made')
        return TestType
      });
    });
  });
});
}

export async function updateTestType(args, context){
  if (
      !args.code ||
     (!args.name  && !args.educationType)
     ){
    throw new Error('Insufficient data')
  }
  return validateTestTypeForUpdate(args, context).then((TestType) => { 
    const matchQuery ={
      active: true,
      code: args.code,
    }
    const patch = {}
    if(args.name) {
      patch.name = args.name
    }
    if(args.classCode){
      patch.classCode= args.classCode
    }
    if(args.educationType){
      patch.educationType = args.educationType
    }
    if(args.subjects){
      patch.subjects = args.subjects
    }
    return TestType.updateOne(matchQuery, patch).then(() => {
      return TestType.findOne(matchQuery)
    });
  });
}