import _ from 'lodash';

import { config } from '../../../config/environment';
import  {getModel as SubjectModel} from '../../settings/subject/subject.model'
import {getModel as TextbookModel} from '../../settings/textbook/textbook.model'
import {getModel as ConceptTaxonomyModel} from '../../settings/conceptTaxonomy/concpetTaxonomy.model'
import {getModel as ContentMappingModel} from '../../settings/contentMapping/contentMapping.model'
const request = require('request');
const xlsx = require('xlsx');

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
  var headers  = ["Name","Subject","Textbook","Chapter","Content Type","Coins"] 
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


export function validateUploadedContentMapping(req){

  let uploadList = req.body.uploadList
  uploadList =JSON.parse( uploadList );
  const classCode = req.body.classCode 
 
  // Reading  workbook
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
  // converting the sheet data to csv
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{defval:''});
  // deleting all trailing empty rows
  for (let i = data.length - 1; i >= 0; i -= 1) {
    let values = Object.values(data[i]);
    values = values.map(x => x.toString());
    // const vals = values.map(x => x.trim());
    if (values.every(x => x === '')) data.pop();
    else break;
  }
  let error  = {}
  error['E0001'] = [] //Null value Error(Missing information)
  error['E0002'] = [] //Invalid coins input
  error['E0003'] = [] //Subjects/Textbooks not existing in database
  error['E0004'] = [] //Count mismatch between comma separated values
  error['E0005'] = [] //invalid subject-textbook combination
  error['E0006'] = [] //invalid chapter-textbook combination 
  error['E0007'] = [] //Name mismatch Error
  error['E0008'] = [] //Invalid File Type

  //checking for null values error code : E0001
  for(var i = 0 ; i < data.length ;i++){
    const temp = data[i]
    const err1 =[]
    temp['Coins'] = String(temp['Coins']).trim()
    let coins = temp['Coins']
    const name  = temp['Name'].trim()
    const subject = temp['Subject'].trim()
    const textbook = temp['Textbook'].trim()
    const contentType = temp['Content Type'].trim()
    const chapter = temp['Chapter'].trim()
    if(name == null || name== ''){
      err1.push('Name')
    }
    if(subject == null ||subject== ''){
      err1.push('Subject')
    }
    if(textbook == null ||textbook==''){
      err1.push('Textbook')
    }
    if(chapter == null || chapter==''){
      err1.push('Chapter')
    }
    if(coins == null || coins==''){
      err1.push('Coins')
    }
    coins = parseInt(coins)
    temp['Coins'] = coins
    //validating coins
    if(coins && coins<0 || typeof(coins) != 'number'){
      error['E0002'].push(`Coins can not be less than 0 or anything other than number at row : ${i+2}`)
    }
    if(contentType == null || contentType==''){
      err1.push('Content Type')
    }
    if(err1.length >0){
      error['E0001'].push(`missing information at columns ${err1} at row ${i+2}`)
    }
  }
  let subjectList = []
  let textbookList = []

  //splitting individual columns 
  data.map(x=>{
    x['Subject'] = x['Subject'].split(',')
    for(var i = 0 ; i < x['Subject'].length;i++){
      x['Subject'][i] = x['Subject'][i].trim()
    }
    x['Textbook'] = x['Textbook'].split(',') 
    for(var i = 0 ; i < x['Textbook'].length;i++){
      x['Textbook'][i] = x['Textbook'][i].trim()
    }
    x['Chapter'] = x['Chapter'].split(',')
    for(var i = 0 ; i < x['Chapter'].length;i++){
      x['Chapter'][i] = x['Chapter'][i].trim()
    }
    subjectList = subjectList.concat(x['Subject'])
    textbookList = textbookList.concat( x['Textbook'])
  })
  textbookList  = [...new Set(textbookList)]
  subjectList   = [...new Set(subjectList)]

  return Promise.all([
    SubjectModel(req.user_cxt),
    TextbookModel(req.user_cxt)
  ]).then(([subjects,textbooks])=>{
   return Promise.all([
    subjects.find({subject :{$in : subjectList}},{_id:0,subject:1}),
    textbooks.find({name :{$in : textbookList},"refs.class.code":classCode},{_id:0,name:1,code:1,orientations:1,branches:1,publisher:1})
   ]).then(([sList,tList])=>{
    let subList = sList.map(x=>x['subject'])
    let tbookList = tList.map(x=>x['name']) 
    let subdifference = subjectList.filter(x => !subList.includes(x));
    //invalid subject error code E0003
    subdifference = subdifference.filter(x => x!='')
    if(subdifference.length >=1){
      error['E0003'].push(`Subjects not existing in database : ${subdifference}`)
    }
    let textbookdifference = textbookList.filter(x => !tbookList.includes(x))
    textbookdifference = textbookdifference.filter(x => x!='')
     //invalid textbook error code E0004
    if(textbookdifference.length >=1){
      error['E0003'].push(`Textbooks not existing in database : ${textbookdifference}`)
    }
    const  subtextQuery = {}
    subtextQuery['$or'] = [] 

    const chaptextQuery = {}
    chaptextQuery['$or'] = []
    chaptextQuery['levelName'] = 'topic'
    var j = 0;

    // checking for subject-textbook combinations
    for(var i = 0 ; i< data.length; i ++){
      let tempObj = data[i];
      if(tempObj.Subject && tempObj.Textbook ){
        if(tempObj.Subject.length != tempObj.Textbook.length){
          error['E0004'].push(`Count mismatch between Subject and TextBook at row : ${i+2}`)
        }
        
        if((tempObj.Subject.length != tempObj.Chapter.length )||( tempObj.Textbook.length!= tempObj.Chapter.length)){
          error['E0004'].push(`Count mismatch between Subject-TextBook and Chapter at row : ${i+2}`)
        }
      
      for(var k = 0 ; k< tempObj.Subject.length; k++){
        subtextQuery['$or'][j] ={
          "refs.subject.name" : tempObj.Subject[k],
          name : tempObj.Textbook[k]
        }
        let textBookCode = tList.find(x=>x.name ===tempObj.Textbook[k]) ? 
        tList.find(x=>x.name ===tempObj.Textbook[k]).code : null
        
        chaptextQuery['$or'][j++]={
          "refs.textbook.code" : textBookCode,
          child : tempObj.Chapter[k]
        }
      }
      }
    } 
    return (textbooks.find(subtextQuery,{_id:0,"name":1,"refs.subject.name":1,"code":1,"publisher":1,
    "orientations":1,"branches":1})).then(
      (subtextList)=>{
        // let subtextMismatch = []
        for(var i = 0 ; i< data.length ; i++){
          let temp = data[i];
          if(temp.Subject && temp.Textbook){
            for(var j = 0 ; j <temp.Subject.length;j++){
            var check = subtextList.find(x=>x.refs.subject.name === temp.Subject[j] && x.name === temp.Textbook[j])
            if(check == undefined){
              error['E0005'].push(`invalid subject-textbook combination at row : ${i+2}`)
            }
            }
          }
        }
      return ConceptTaxonomyModel(req.user_cxt).then((conceptTaxonomy)=>{
        return conceptTaxonomy.find(chaptextQuery,{_id:0,"child":1,"refs.textbook.code":1,"childCode":1,"refs.textbook.name":1}).then((topicList)=>{
          // let chaptextMismatch = []
          for(var i = 0 ; i< data.length ; i++){
            let temp = data[i];
            if(temp.Subject && temp.Textbook){
              for(var j = 0 ; j <temp.Subject.length;j++){
              let textBookCode = tList.find(x=>x.name ===temp.Textbook[j]) ? 
              tList.find(x=>x.name ===temp.Textbook[j]).code : null
              var check = topicList.find(x=>x.refs.textbook.code === textBookCode && x.child === temp.Chapter[j])
              if(check == undefined){
                error['E0006'].push(`invalid chapter-textbook combination at row : ${i+2}`)
              }
              }
              let u = uploadList.find(x=>x['Name'] == temp['Name'])
              if(u == undefined || null){
                error['E0007'].push(`Name mismatch at row : ${i+2}`)
              }
            }
          }

          let count = 0
          const keys = error && Object.keys(error) ? Object.keys(error) : []
          for(var j = 0 ; j<keys.length ;j++){
            
            if(error[keys[j]].length >0 ){
              // return error
              count ++
            }
            else{
              delete error[keys[j]]
            }
          }
          if(count >0 ){
            return error
          }
          //preparing documents for insertion
          return ContentMappingModel(req.user_cxt).then((contentMapping)=>{
          const bulk = contentMapping.collection.initializeUnorderedBulkOp()
          const finalObj = []
          var k =0;
          for(var i = 0 ; i <data.length;i++){
            let temp = data[i]
            for(var j = 0 ; j <temp.Subject.length;j++){
            let textBookCode = tList.find(x=>x.name ===temp.Textbook[j]).code
            let t = topicList.find(x=>x.refs.textbook.code === textBookCode &&
               x.child === temp.Chapter[j])
            let s = subtextList.find(x=>x.refs.subject.name === temp.Subject[j] && 
              x.name === temp.Textbook[j])
            let u = uploadList.find(x=>x['Name'] == temp['Name'])
            let setobj = {}
            let whereObj = {}
            whereObj['content.name'] = temp['Name']
            whereObj['refs.textbook.code'] = s.code
            whereObj['refs.topic.code'] = t.childCode
            whereObj['active']  = true;
            setobj['content'] = {
              name: temp['Name'],
              category: req.body.contentCategory,
              type : temp['Content Type']
            }
            setobj['resource'] ={
              key : u['Key'],
              size: u['Size'],
              type : u['Type']
            }
            setobj["publication.publisher"] = s.publisher
            setobj["publication.year"] = null
            setobj['coins'] = temp['Coins']
            setobj['active'] = true
            setobj['refs']={
              topic:{
                code:t.childCode
              },
              textbook:{
                code:s.code
              }
            }
            setobj['category'] = ''
            setobj['orientation'] = s.orientations
            setobj['branches'] = s.branches
            finalObj[k++] = setobj
            bulk.find(whereObj).upsert().updateOne(setobj);
            }
          }
          
          return bulk.execute().then((obj) => {
            return `${req.file.originalname} : Uploaded successfully`
          }).catch((err) => {
            return 'Error occured while uploading'
          });
          })
          })
        })
      })
    })
   });
1  }

export async function uploadedContentMapping(req,res){
  if(!req){
    throw new Error('No request received')
  }
  if(!req.file){
    throw new Error('File required')
  }
  if(!req.body||!req.body.contentCategory){
    throw new Error('content category required')
  }
  if(!req.body||!req.body.classCode){
    throw new Error('Class required')
  }
  if(!req.body||!req.body.uploadList){
    throw new Error('list required')
  }
   //vaidating file type
   let error ={}
   const name = req.file.originalname.split('.');
   const extname = name[name.length - 1];
   if ( extname !== 'xlsx') {
    error['E0008'] = 'Invalid File Type'
    return res.status(400).send(error).end();
   }
   
  return validateUploadedContentMapping(req).then((done)=>{
    if(done.error){
      res.status(400).send(done.error).end()
    }
    res.status(200).send(done).end()
  })
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
