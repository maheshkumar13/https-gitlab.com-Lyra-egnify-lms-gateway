import { getModel as TestModel } from './tests.model';
import { getModel as InstituteHierarchyModel} from '../../settings/instituteHierarchy/instituteHierarchy.model'
import { getModel as StudentModel } from '../../settings/student/student.model'
import { getModel as CounterModel } from '../../settings/Counter/counter.model'
import {getModel as TestPatternModel} from '../../settings/testPattern/testPattern.model'
import { config } from '../../../config/environment';

const crypto = require('crypto');
const controller1 = require('../../settings/testPattern/testPattern.controller');

  
  async function getStudentData(className , context){
    const query = {
      'hierarchy.1.child' : className
    } 

    return StudentModel(context).then((Student) => {
      return Student.findOne(query);
    })
  }
  
  export async function validateTest(args, context){
    const query = {
      active: true,
      name: args.name,
    }
    return TestModel(context).then((Test) => {
      return Test.findOne(query).then((obj) => {
        if (obj) return true
        return false
      })
    })
  }

  export async function createTest(args, context){
    args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
    if(!args.name || args.name == ''){
        throw new Error('Specify a test name');
    }
    if(!args.class || args.class == ''){
        throw new Error('Specify a class name');
    }
    return validateTest(args, context).then((TestExists) => {
        if(TestExists) throw new Error('Test name already taken');
        return Promise.all([
          getStudentData(args.class , context),
          controller1.validateSchema(args.testPattern , context),
          TestModel(context),
          CounterModel(context)
        ]).then(([
          StudentData,
          TestPattern,
          Test,
          Counter
        ]) => {
          const classCode = StudentData.hierarchy[1].childCode;
          const obj1 = TestPattern;
          console.log('obj1' ,obj1);

          const params = { counter: 'testtypecounter', value: 1}
          return Counter.getNext(params).then((next)=>{
            next = String(next["value"]["sequence_value"])
            console.log(next);

          const obj = {
            name: args.name,
            testId:  'T' + ('000' + String(next)).substr(-3),
            class : args.class,
            classCode : classCode,
            questionPaperId : args.questionPaperId,
            Type : args.Type,
            avgPaperTime : args.avgPaperTime,
            date : args.date,
            duration : args.duration,
            testPattern : obj1
          }

          const hours = parseInt(args.time.split(':')[0]);  
          const minutes = parseInt(args.time.split(':')[1]);
          let startTimeDate = new Date(args.date);
          startTimeDate.setHours(hours);
          startTimeDate.setMinutes(minutes);
          obj.startTime = startTimeDate;

          return Test.create(obj);
        })
        })
    })
  }
