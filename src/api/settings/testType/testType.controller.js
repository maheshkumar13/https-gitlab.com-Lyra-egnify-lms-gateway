/**
 * @Author :Aditi
 * @date
 */

import { getModel as TestTypeModel } from './testType.model';
import { config } from '../../../config/environment';
import { getModel as InstituteHierarchyModel} from '../instituteHierarchy/instituteHierarchy.model'
import { getModel as CounterModel} from '../Counter/counter.model';
import {getModel as SubjectModel} from '../subject/subject.model'
import {getHierarchyData} from '../textbook/textbook.controller'

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
        const classData = hierarchyData.find( x => x.levelName === 'Class' && x.childCode === args.classCode);
        if(
        !classData 
        ){
          throw new Error('Invalid input codes ')
        }
    const params = { counter: 'testtypecounter', value: 1}
    return Counter.getNext(params).then((next)=>{
      next = next["value"]["sequence_value"]
      if(next/1000 < 1){
        next = 'T' + ('000' + String(next)).substr(-3)
      }
      else{
        next = String(next)
      }
      const obj = {
        name: args.name,
        code: next,
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
   if (args && args.classCode) query['classCode'] = args.classCode;
   if (args && args.educationType) query['educationType'] = args.educationType;
   return query;
 };

export async function getTestType(args, context){
   const query = getTestTypeQuery(args)
   const project = {
    name: 1,
    code: 1,
    classCode :1,
    educationType:1,
    subjects:1
  }
  return TestTypeModel(context).then( (testType) => {
    return testType.find(query,project).then((testList)=>{
      var subs = []
      for(var value in testList){
        subs = subs.concat(testList[value]['subjects']) 
      }
      var query ={
        code : {$in:subs}
      }
      return Promise.all([InstituteHierarchyModel(context),SubjectModel(context)]).then(
      ([instituteHierarchy,subjects])=>{
        return Promise.all([
          subjects.find(query,{subject:1,code:1, _id:0}),
          instituteHierarchy.find({levelName:"Class"},{childCode:1,child:1})
        ]).then(([
          subjectList,
          classList
        ])=>{
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
        });
      });
    });
  });
 }

export async function deleteTestType(args, context) {
  if (!args || !args.code) throw new Error('Code is required')
  return TestTypeModel(context).then((testType) => {
    const query = { active: true, code: args.code }
    const patch = { active: false}
    return testType.findOneAndUpdate(query,patch).then((doc) => {
      if(!doc) throw new Error('TestType not found with given code')
      return doc ;
    });
  });
}

export async function validateTestTypeForUpdate(args, context){
  let query = {
    code: args.code,
  }
  return TestTypeModel(context).then((testType) => {
    return testType.findOne(query,{_id:0,active:1,name:1,classCode:1,subjects:1,educationType:1}).then((obj) => {
      if (!obj) throw new Error('TestType not found with given code')
      obj.active = true
      if(args) {
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
      }
    return testType.findOne(obj,{code:1}).then((doc) => {
      if(doc){
        throw new Error(`Test Already Exists With Code ${doc.code}`)
      }
      return testType
    });
  });
});
}

export async function updateTestType(args, context){
  if (!args || !args.code){
    throw new Error('code required to make an update')
  }
  if(!args.name && !args.educationType &&!args.classCode && !args.subjects ){
    throw new Error('Insufficient data : Input atleast one field to update.')
  }
  return validateTestTypeForUpdate(args, context).then((testType) => { 
    const matchQuery ={
      code: args.code,
    }
    const patch = {
      active: true
    }
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
    return testType.updateOne(matchQuery, patch).then((obj) => {
      if(obj.nModified <1){
        return "No Document Matched For Update"
      }
      return "Updated Successfully"
    });
  });
}