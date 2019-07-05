import _ from 'lodash';

import { config } from '../../../config/environment';
import  {getModel as SubjectModel} from '../../settings/subject/subject.model'
import {getModel as TextbookModel} from '../../settings/textbook/textbook.model'
import {getModel as ConceptTaxonomyModel} from '../../settings/conceptTaxonomy/concpetTaxonomy.model'
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
  var headers  = ["Name","Subject","Textbook","Chapter","Coins","Class","Size","Type"] 
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
  // converting csvdata to array of json objects
  const data = csvjson.toObject(csvdata);
	// deleting all trailing empty rows
	for (let i = data.length - 1; i >= 0; i -= 1) {
		const values = Object.values(data[i]);
		const vals = values.map(x => x.trim());
		if (vals.every(x => x === '')) data.pop();
		else break;
  }

  for(var i = 0 ; i <data.length ;i++){
    const temp = data[i]
    const err1 =[]
    // console.log(temp)
    if(temp['Name'] == null || temp['Name']== ''){
      err1.push('Name')
    }
    if(temp['Subject'] == null || temp['Subject']== ''){
      err1.push('Subject')
    }
    if(temp['Textbook'] == null || temp['Textbook']==''){
      err1.push('Textbook')
    }
    if(temp['Chapter'] == null || temp['Chapter']==''){
      err1.push('Chapter')
    }
    if(temp['Coins'] == null || temp['Coins']==''){
      err1.push('Coins')
    }
    // console.log(err1)
    if(err1.length >0){
      throw new Error(`Missing information at row :${i+2} , columns : [ ${err1} ]`)
    }
  }
  let subjectList = []
  let textbookList = []
  data.map(x=>{
    x['Subject'] = x['Subject'].split('/')
    x['Textbook'] = x['Textbook'].split('/')
    x['Chapter'] = x['Chapter'].split('/')
    subjectList = subjectList.concat(x['Subject'])
    textbookList = textbookList.concat( x['Textbook'])
  })
  textbookList  = [...new Set(textbookList)]
  subjectList   = [...new Set(subjectList)]
  let coinCheck = data.map(x=>parseInt(x["Coins"]))

  //validating coins column.
  coinCheck = coinCheck.findIndex(x=>x<0)
  if(coinCheck > -1){
    throw Error(`Coins can not be less than 1 at row number ${coinCheck+1}`)
  }

  return Promise.all([
    SubjectModel(req.user_cxt),
    TextbookModel(req.user_cxt)
  ]).then(([subjects,textbooks])=>{
   return Promise.all([
    subjects.find({subject :{$in : subjectList}},{_id:0,subject:1}),
    textbooks.find({name :{$in : textbookList}},{_id:0,name:1,code:1,orientations:1,branches:1})
   ]).then(([subList,tbookList])=>{
    subList = subList.map(x=>x['subject'])
    tbookList = tbookList.map(x=>x['name']) 
    let difference = subjectList.filter(x => !subList.includes(x));
    if(difference.length >=1){
      throw new Error('Invalid Subject:',difference[0])
    }
    difference = textbookList.filter(x => !tbookList.includes(x))
    if(difference.length >=1){
      throw new Error(`Invalid Textbook: ${difference[0]}`)
    }
    const  subtextQuery = {}
    subtextQuery['$or'] = [] 

    const chaptextQuery = {}
    chaptextQuery['$or'] = []
    chaptextQuery['levelName'] = 'topic'
    var j = 0;

    //checking for null values



    // checking for subject-textbook combinations
    for(var i = 0 ; i< data.length; i ++){
      let tempObj = data[i];
      if(tempObj.Subject.length > tempObj.Textbook.length){
        throw new Error(`Missing TextBook at row number ${i+2}`)
      }
      if(tempObj.Subject.length < tempObj.Textbook.length){
        throw new Error(`Missing Subject at row number ${i+2}`)
      }
      if(tempObj.Subject.length != tempObj.Chapter.length){
        throw new Error(`Number of chapters inconsistent at row number ${i+1}`)
      }
      
      for(var k = 0 ; k< tempObj.Subject.length; k++){
        subtextQuery['$or'][j] ={
          "refs.subject.name" : tempObj.Subject[k],
          name : tempObj.Textbook[k]
        }
        chaptextQuery['$or'][j++]={
          "refs.textbook.name" : tempObj.Textbook[k],
          child : tempObj.Chapter[k]
        }
      }
    } 
    return (textbooks.find(subtextQuery,{_id:0,"name":1,"refs.subject.name":1,code:1})).then(
      (subtextList)=>{
        // console.log("------result-------\n",subtextList)
        let subtextMismatch = []
        for(var i = 0 ; i< data.length ; i++){
          let temp = data[i];
          for(var j = 0 ; j <temp.Subject.length;j++){
          var check = subtextList.find(x=>x.refs.subject.name === temp.Subject[j] && x.name === temp.Textbook[j])
          // console.log(subtextList.find(x=>x.refs.subject.name === temp.Subject[j] && x.name === temp.Textbook[j]))
          if(check == undefined){
            subtextMismatch.push({ row:(i+2),subject:temp.Subject[j],textbook:temp.Textbook[j]})
          }
          }
        }
        if(subtextMismatch.length > 0 ){
          throw new Error(`invalid subject-textbook combination at following rows :[${subtextMismatch.map(x=>x.row)}]`)
        }
        
      return ConceptTaxonomyModel(req.user_cxt).then((conceptTaxonomy)=>{
        // console.log('chaper-text---------\n',chaptextQuery)
        return conceptTaxonomy.find(chaptextQuery,{_id:0,"child":1,"refs.textbook.name":1,"childCode":1}).then((topicList)=>{
          console.log(topicList)
          let chaptextMismatch = []
          for(var i = 0 ; i< data.length ; i++){
            let temp = data[i];
            for(var j = 0 ; j <temp.Subject.length;j++){
            var check = topicList.find(x=>x.refs.textbook.name === temp.Textbook[j] && x.child === temp.Chapter[j])
            // console.log(subtextList.find(x=>x.refs.subject.name === temp.Subject[j] && x.name === temp.Textbook[j]))
            if(check == undefined){
              chaptextMismatch.push({ row:(i+2),chapter:temp.Chapter[j],textbook:temp.Textbook[j]})
            }
            }
          }
          if(chaptextMismatch.length > 0 ){
            throw new Error(`invalid chapter-textbook-subject combination at following rows :[${chaptextMismatch.map(x=>x.row)}]`)
          }

          //preparing documents for insertion
          for(var i = 0 ; i <data.length;i++){
            let temp = data[i]
            for(var j = 0 ; j <temp.Subject.length;j++){
            let obj = {}
            obj['content'] = {
              name: temp['Name'],
              category: null,
              type : null
            }
            obj['content.name'] = temp['Name']
            obj['content.category'] = null
            obj['resource.key'] = temp["Size"]
            obj['resource.size'] = temp["Type"]
            obj['resource.type']= temp["Key"]
            obj["publication"] = {}
            obj["publication.publisher"] = null
            obj["publication.year"] = null
            obj['coins'] = temp['Coins']
            obj['active'] = true
            obj['category'] = null
            obj["refs.topic.code"] = topicList.find(x=>x.refs.textbook.name === temp.Textbook[j] && x.child === temp.Chapter[j]).childCode
            obj["refs.textbook.code"] =  subtextList.find(x=>x.refs.subject.name === temp.Subject[j] && x.name === temp.Textbook[j]).code
            console.log(obj)
            }
          }
        })
      })
    })
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
