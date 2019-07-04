import _ from 'lodash';

import { config } from '../../../config/environment';
import  {getModel as SubjectModel} from '../../settings/subject/subject.model'
import {getModel as TextbookModel} from '../../settings/textbook/textbook.model'
const request = require('request');

// function to download testResultsReport
export function testResultsReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/testResultsReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentResponseReport
export function studentResponseReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentResponseReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentErrorReport
export function studentErrorReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentErrorReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download cwuAnalysisReport
export function cwuAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/cwuAnalysisReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  // form['testIds'] = ["000035"];
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}


export function testVsEstimatedAveragesReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/testVsEstimatedAveragesReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentPerformanceTrendReport

export function studentPerformanceTrendReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/reports/download/studentPerformanceTrendReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}
// function to download studentPreviousAndPresentTestReport

export function studentPreviousAndPresentTestReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/reports/download/studentPreviousAndPresentTestReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

export async function studentComparisionTrendReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentComparisionTrendReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download weakSubjectReport
export async function weakSubjectReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/weakSubjectReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;
  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download studentMarksAnalysisReport
export function studentMarksAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/masterResult/download/studentMarksAnalysisReport`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

// function to download allstudentConceptAnalysis
export function allstudentConceptAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/Analysis/download/allstudentConceptAnalysis`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

export function allTestAverageAnalysisReport(req, res) {
  const submissionUrl = `${config.services.test}/api/v1/allTestsAnalysis/download/allTestAverageAnalysis`;
  const { body } = req;
  const form = {};
  _.forEach(body, (value, key) => {
    form[key] = value;
  });
  form.user = req.user;

  const options = {
    uri: submissionUrl,
    method: 'POST',
    json: form,
  };
  request(options).pipe(res);
}

export function downloadContentMappingSample(req,res){
  if(!req || !req.body){
    throw new Error('Please provide with the inputs')
  }
  const args = req.body ;
  if(!args.uploadList){
    throw new Error("Need atleast one entry")
  }
  const result = []
  var headers  = ["Name","Subject","Textbook","Chapter","Coins","Class"] 
  for(var i = 0 ; i < args.uploadList.length; i++){
    var row = {}
    const obj = args.uploadList[i];
    for(var j = 0 ; j< headers.length ;j++){
      row[headers[j]] = obj[headers[j]] ? obj[headers[j]] : ""
    }
    result[i] = row
  }
  res.send(result)
}


const fs = require('fs');
const xlsx = require('xlsx');
const csvjson = require('csvjson');


export function validateUploadedContentMapping(req){
  if(!req.file){
    throw new Error('File required')
  }
  console.log("-------------Inside validation\n");
  const name = req.file.originalname.split('.');
  const extname = name[name.length - 1];
	if ( extname !== 'xlsx') {
		throw new Error('Invalid FileType')
  }
  // Reading  workbook
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
  // converting the sheet data to csv
  const csvdata = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
  console.log(csvdata)
  // converting csvdata to array of json objects
  const data = csvjson.toObject(csvdata);
  console.log(data)
	// deleting all trailing empty rows
	for (let i = data.length - 1; i >= 0; i -= 1) {
		const values = Object.values(data[i]);
		const vals = values.map(x => x.trim());
		if (vals.every(x => x === '')) data.pop();
		else break;
  }
  let subjectList = []
  subjectList = data.map(x=>{
    console.log(x)
    subjectList.concat(x['Subject'].split(","))
  })
  console.log(subjectList)
  // array1.concat(array2).unique()
  const textbookList = data.map(x=>x['Textbook'])
  let coinCheck = data.map(x=>parseInt(x["Coins"]))

  //validating coins column.
  coinCheck = coinCheck.findIndex(x=>x<0)
  if(coinCheck > -1){
    throw Error(`Coins can not be less than 1 at row number ${coinCheck+1}`)
  }
  
  console.log("------------------\n",textbookList)
  return Promise.all([
    SubjectModel(req.user_cxt),
    TextbookModel(req.user_cxt)
  ]).then(([subjects,textbooks])=>{
   return Promise.all([
    subjects.find({subject :{$in : subjectList}},{_id:0,subject:1}),
    textbooks.find({name :{$in : textbookList}},{_id:0,name:1})
   ]).then(([subList,tbookList])=>{
    subList = subList.map(x=>x['subject'])
    tbookList = tbookList.map(x=>x['name']) 
    console.log(subList)
    console.log(tbookList)
    let difference = subjectList.filter(x => !subList.includes(x));
    if(difference.length >=1){
      throw new Error('Invalid Subject:',difference[0])
    }
    difference = textbookList.filter(x => !tbookList.includes(x))
    if(difference.length >=1){
      throw new Error('Invalid Textbook:',difference[0])
    }
   });
  });
}

export async function uploadedContentMapping(req,res){
  validateUploadedContentMapping(req)
}

export default {
  studentResponseReport,
  studentErrorReport,
  cwuAnalysisReport,
  studentComparisionTrendReport,
  testVsEstimatedAveragesReport,
  weakSubjectReport,
  studentPreviousAndPresentTestReport,
  allstudentConceptAnalysisReport,
  uploadedContentMapping
};
