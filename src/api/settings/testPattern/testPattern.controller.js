import { getModel as TestPatternModel } from './testPattern.model';
import { config } from '../../../config/environment';

const _ = require('lodash');

function validateMarksSection(section, subject = 'Subject') {
  if (
    section.W === undefined ||
    !section.questionType ||
    section.C === undefined ||
    section.U === undefined ||
    section.numberOfQuestions === undefined 
    // section.numberOfSubQuestions === undefined ||
    // section.totalMarks === undefined
    // section.ADD === undefined
  ) {
    throw new error('Insufficient data');
  }
  const {
    C, W, U, ADD, P,
   numberOfQuestions, questionType
  } = section;
  if (C === '' || C < 0) {
    throw new Error('Invalid Correct Marks. It must be a positive integer!');
  }
  if (W === '' || W > 0) {
    throw new Error('Invalid Wrong Marks.');
  }
  if (U === '' || U > 0 || U < W) {
    throw new Error('Invalid Unattempted Marks.');
  }
  // if (ADD < 0) {
  // throw new Error('Invalid Additional Marks.');
  // }
  if (P === '' || P > C || P < 0) {
    throw new Error('Invalid Partial Marks.');
  }

  if (numberOfQuestions == 0) {
    throw new Error('No. of questions must be greater than zero');
  }
  if (!questionType || questionType === '') {
    throw new Error('Specify a type for the questions');
  }
  // if (section.numberOfQuestions > section.numberOfSubQuestions) {
  //   return { err: 'Number of question must be greater than no of sub-questions' };
  // }
   section.totalMarks = section.C * section.numberOfQuestions ;
    // throw new Error('Total Marks not equal to Correct answer score * number of questions');
    // return { err: `${subject}'s section's total marks is incorrect` };
  
  // const subQues = numberOfSubQuestions / numberOfQuestions;
  // if (marksPerQuestion !== subQues * C) {
  //   return { err: `Incorrect mark per question in ${subject}` };
  // }
  // console.log(section.totalMarks , section.numberOfQuestions);
  return true;
}
function validateSubject(subject) {
  if (
    !subject.subject ||
    // !subject.totalMarks ||
    // !subject.totalQuestions ||
    !subject.marks
    // !subject.code ||
    // !subject.parentCode ||
    // !subject.subjectCode
    ){
      throw new Error('Insufficient subject details');
  }
  const { marks } = subject; // eslint-disable-line
  if (marks.length === 0) {
    throw new Error('Atleast one section required');
  }
  let totalMarks = 0;
  let totalQ = 0;
  for (let k = 0; k < marks.length; k += 1) {
    const section = marks[k];
    const valid = validateMarksSection(section, subject.subject);
    if (!valid){
      throw new Error('Not valid Marks distribution');
    };
    totalMarks += section.totalMarks;
    totalQ += section.numberOfQuestions;
  }
  // if (totalMarks !== subject.totalMarks ||
  // totalQ !== subject.totalQuestions) throw new Error('Marking Schema has inconsistencies w.r.t. totalmarks and totalquestions for question type of a subject');
  const obj = {
    totalMarks : totalMarks,
    totalQuestions : totalQ,
  }
  console.log('obj' , obj);
  return obj;
}

export function validateSubjectFields(args) {
  // if (!args.totalQuestions) {
  //   throw new Error('totalQuestions is not defined');
  // }
  // if (!args.totalMarks) {
  //   throw new Error('totalMarks is not defined');
  // }
  if (!args.subjects) {
    throw new Error('subjects are not defined');
  }
  if (args.subjects.length === 0) {
    throw new Error('At least one subject required');
  }
  // if (!args.markingSchemaType) {
  //   return { err: 'markingSchemaType required' };
  // }

  // if (!markingSchemaTypeList.includes(args.markingSchemaType)) {
  //   return { err: 'Invalid markingSchemaType' };
  // }
  let totalMarks = 0;

  let totalQ = 0;
  for (let i = 0; i < args.subjects.length; i += 1) {
    const subject = args.subjects[i];
    const valid = validateSubject(subject);
    if (!valid) return valid;
    subject.totalMarks = valid.totalMarks;
    subject.totalQuestions = valid.totalQuestions;
    totalMarks += valid.totalMarks;
    totalQ += valid.totalQuestions;
  }
  // if (totalMarks !== args.totalMarks ||
  // totalQ !== args.totalQuestions) throw new Error('Marking Schema has inconsistencies w.r.t. totalmarks and totalquestions for a subject');;

  const obj = {
    totalMarks : totalMarks,
    totalQuestions : totalQ,
  }
  // console.log('args.subjects[0].totalMarks' , args.subjects[0].totalMarks , 'args.subjects[0].totalQuestions' , args.subjects[0].totalQuestions)
  // console.log('args.subjects[1].totalMarks' , args.subjects[1].totalMarks , 'args.subjects[1].totalQuestions' , args.subjects[1].totalQuestions)
  // console.log('args.subjects[2].totalMarks' , args.subjects[2].totalMarks , 'args.subjects[2].totalQuestions' , args.subjects[2].totalQuestions)

  return obj;
}

function addStartAndEndInSubjects(subjects) {
  let end = 0;
  let start = 0;
  const modifiedSubjects = subjects;
  for (let i = 0; i < modifiedSubjects.length; i += 1) {
    if (!modifiedSubjects[i].tieBreaker) { modifiedSubjects[i].tieBreaker = i + 1; }
    start = end + 1;
    end += modifiedSubjects[i].totalQuestions;
    modifiedSubjects[i].start = start;
    modifiedSubjects[i].end = end;
    let end1 = start - 1;
    let start1 = 0;
    for (let j = 0; j < modifiedSubjects[i].marks.length; j += 1) {
      modifiedSubjects[i].marks[j].section = j + 1;
      start1 = end1 + 1;
      end1 += modifiedSubjects[i].marks[j].numberOfQuestions;
      modifiedSubjects[i].marks[j].start = start1;
      modifiedSubjects[i].marks[j].end = end1;
    }
  }
  return modifiedSubjects;
}

function checkTestName(testName) {
  return { testName, active: true };
}

export async function createTestPattern(args , context) {
  if (!args.testName || args.testName === '') {
    throw new Error('Specify a name for the test!');
  }
  if (!args.testType || args.testType === '') {
    throw new Error('Specify a type for the test!'); // need an array from which to search for
  }
  if (!args.markingSchemaType || args.markingSchemaType === '') {
    throw new Error('Specify a schema for the test!'); // need an array from which to search for
  }
  const query = checkTestName(args.testName);
  return TestPatternModel(context).then((TestPattern) => {
    return TestPattern.findOne(query).then((doc) => {
      if (doc) {
        throw new Error('TestName already exists!');
      }
      const getTestData = validateSubjectFields(args);
      if (!getTestData) {
        throw new Error('Check Subject Details!');
      }

      args.subjects = addStartAndEndInSubjects(args.subjects);
      const obj = {
        testName: args.testName,
        totalQuestions: getTestData.totalQuestions,
        subjects: args.subjects,
        totalMarks: getTestData.totalMarks,
        testType: args.testType,
        markingSchemaType : args.markingSchemaType,
        
      }
      return TestPattern.create(obj)
    });
  });
}

export async function updateTestPattern(args , context){
  if (!args.testName || args.testName === '') {
    throw new Error('Specify a name for the test!');
  }
  const query = checkTestName(args.testName);
  return TestPatternModel(context).then((TestPattern) => {
    return TestPattern.findOne(query).then((doc) => {
      if (!doc) {
        throw new Error('TestName not found');
      }
      const getTestData = validateSubjectFields(args);
      if (!getTestData) {
        throw new Error('Check Subject Details!');
      }

      args.subjects = addStartAndEndInSubjects(args.subjects);
      const obj = {
        testName: args.testName,
        totalQuestions: getTestData.totalQuestions,
        subjects: args.subjects,
        totalMarks: getTestData.totalMarks,
        testType: args.testType,
        markingSchemaType : args.markingSchemaType,
        
      }
      const query = {
        testName : args.testName,
      }

      return TestPattern.updateOne(query, obj).then(() => {
        return TestPattern.findOne(query)
      })
    });
  });
}

export async function deleteTestPattern(args, context) {
  if (!args.testName) throw new Error('Testname is required')
  return TestPatternModel(context).then((TestPattern) => {
    const query = { active: true, testName : args.testName }
    const patch = { active: false}
    return TestPattern.findOneAndUpdate(query,patch).then((doc) => {
      if(!doc) throw new Error(`TestPattern with the name ${args.testName} not found`);
      return doc
    })
  })
}

// export async function updateTestPattern(args, context){
//   if(!args.testName){
//     throw new Error('Specify a test Name to update!');
//   }
//   if(!args.subjectName){
//     throw new Error('Specify a subject name!');
//   }
//   if(!args.questionType){
//     throw new Error('Specify a question type!');
//   }
//   const query = checkTestName(args.testName);
//   return TestPatternModel(context).then((TestPattern) => {
//     return TestPattern.findOne(query).then((doc) => {
//       if(!doc){
//         throw new Error('No such test Name exists!');
//       }
//       let subject_index = -1;
//       for(let i = 0 ; i < doc.subjects.length ; i++){
//         if(doc.subjects[i].subject === args.subjectName){
//             subject_index = i;
//             break;
//         }
//       }
//       // console.log('subject_index' , subject_index)
//       if(subject_index == -1){
//         throw new Error('Subject not found!');
//       }
//       let marks_index = -1;
//       // console.log('marks_index' , marks_index);
//       for(let i = 0 ; i < doc.subjects[subject_index].marks.length ; i++){
//         if(doc.subjects[subject_index].marks[i].questionType === args.questionType){
//             marks_index = i;
//             break;
//         }
//       }
//       // console.log('marks_index' , marks_index)
//       if(marks_index == -1){
//         throw new Error('Question Type not found!')
//       }

//       const obj = {
//         testName: doc.testName,
//         subjects: doc.subjects,
//         // totalQuestions: doc.totalQuestions,
//         // totalMarks: doc.totalMarks,
//         // testType: doc.testType,
//         // markingSchemaType : doc.markingSchemaType,
//         // active : doc.active,
//       }
//       console.log('obj' , obj);
//       if(args.numberOfQuestions){
//         obj.subjects[subject_index].marks[marks_index].numberOfQuestions = args.numberOfQuestions;
//       }
//       if(args.noOfOptions){
//         obj.subjects[subject_index].marks[marks_index].noOfOptions = args.noOfOptions;
//       }
//       if(args.numberOfSubQuestions){
//         obj.subjects[subject_index].marks[marks_index].numberOfSubQuestions = args.numberOfSubQuestions;
//       }
//       if(args.C){
//         obj.subjects[subject_index].marks[marks_index].C = args.C;
//       }
//       if(args.W){
//         obj.subjects[subject_index].marks[marks_index].W = args.W;
//       }
//       if(args.P){
//         obj.subjects[subject_index].marks[marks_index].P = args.P;
//       }
//       if(args.W){
//         obj.subjects[subject_index].marks[marks_index].W = args.W;
//       }

//       // const obj = {
//       //   testName: doc.testName,
//       //   totalQuestions: doc.totalQuestions,
//       //   subjects: doc.subjects,
//       //   totalMarks: doc.totalMarks,
//       //   testType: doc.testType,
//       //   markingSchemaType : doc.markingSchemaType,
//       //   active : doc.active,
//       // }
//       // console.log(obj);

//       const query = {
//         testName : args.testName,
//       }

//       return TestPattern.updateOne(query, obj).then(() => {
//         return TestPattern.findOne(query)
//       })
//     })
//   })
// }

// //READ
// function getTestPatternsQuery(args){
//   const query = { active: true }
//   if (args.testName) query['testName'] = args.classCode;
//   if (args.totalQuestions) query['totalQuestions'] = args.totalQuestions;
//   if (args.totalMarks) query['totalMarks'] = args.totalMarks;
//   if (args.testType) query['testType'] = args.testType;
//   if (args.markingSchemaType) query['markingSchemaType'] = args.markingSchemaType;

//   return query
// }
// export async function getTestPatterns(args, context){
//     const query = getTestPatternsQuery(args)
//     console.log(query);
//     return TestPatternModel(context).then( (TestPattern) => {
//       return TestPattern.find(query)
//     })
// }
//READ END