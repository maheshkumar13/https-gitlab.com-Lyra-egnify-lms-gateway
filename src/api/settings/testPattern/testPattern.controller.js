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
  if (ADD < 0) {
  throw new Error('Invalid Additional Marks.');
  }
  if (P === '' || P > C || P < 0) {
    throw new Error('Invalid Partial Marks.');
  }

  if (numberOfQuestions == 0) {
    throw new Error('No. of questions must be greater than zero');
  }
  if (!questionType || questionType === '') {
    throw new Error('Specify a type for the questions');
  }
  
   section.totalMarks = section.C * section.numberOfQuestions ;
    
  return true;
}
function validateSubject(subject) {
  if (
    !subject.subject ||
    !subject.marks
    ){
      throw new Error('Insufficient subject details');
  }
  const { marks } = subject; 
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
   const obj = {
    totalMarks : totalMarks,
    totalQuestions : totalQ,
  }
  console.log('obj' , obj);
  return obj;
}

export function validateSubjectFields(args) {
  
  if (!args.subjects) {
    throw new Error('subjects are not defined');
  }
  if (args.subjects.length === 0) {
    throw new Error('At least one subject required');
  }
  
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
  
  const obj = {
    totalMarks : totalMarks,
    totalQuestions : totalQ,
  }
  
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
    throw new Error('Specify a type for the test!'); 
  }
  if (!args.markingSchemaType || args.markingSchemaType === '') {
    throw new Error('Specify a schema for the test!'); 
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
  if (!args.testName || args.testName == '') throw new Error('Testname is required')
  return TestPatternModel(context).then((TestPattern) => {
    const query = { active: true, testName : args.testName }
    const patch = { active: false}
    return TestPattern.findOneAndUpdate(query,patch).then((doc) => {
      if(!doc) throw new Error(`TestPattern with the name ${args.testName} not found`);
      return doc
    })
  })
}


export async function validateSchema(args , context) {
  if (!args.testName || args.testName === '') {
    throw new Error('Specify a name for the test!');
  }
  if (!args.testType || args.testType === '') {
    throw new Error('Specify a type for the test!'); 
  }
  if (!args.markingSchemaType || args.markingSchemaType === '') {
    throw new Error('Specify a schema for the test!'); 
  }
  const query = checkTestName(args.testName);
  return TestPatternModel(context).then((TestPattern) => {
    return TestPattern.findOne(query).then((doc) => {
      if (!doc) {
        throw new Error('Schema does not exist!');
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
        active : true,
      }
      return obj;
    });
  });
}
