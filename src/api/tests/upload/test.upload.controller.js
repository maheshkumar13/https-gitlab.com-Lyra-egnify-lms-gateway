import {
  getModel as Tests
} from './test.model';

import {
  getModel as TextBook
} from '../../settings/textbook/textbook.model';
const xlsx = require('xlsx');
import {getModel as Questions} from '../questions/questions.model';
import {getModel as StudentInfoSchema} from '../../settings/student/student.model'
import {
  getModel as Chapter
} from '../../settings/conceptTaxonomy/concpetTaxonomy.model'

import {
  getModel as TestTimings
} from '../testTiming/testtiming.model'
const GA_SCHEDULER_URL = require('../../../config/environment')["config"]["GA_SCHEDULER_URL"];
const uuidv4 = require("uuid/v4");
import {getModel as Hierarchy} from '../../settings/instituteHierarchy/instituteHierarchy.model';
import {getModel as Subject} from '../../settings/subject/subject.model';
import {getModel as MasterResult } from './masterresults.model';
import {getModel as TestSummarySchema } from './testSummary.model';
const MAPPING_HEADERS = ["class","subject","textbook","chapter","test name","view order"]
const TEST_TIMING_HEADERS = ["branches","end date","start date","duration"];
const axios = require("axios");

function queryForListTest(args) {
  let query = {
    search: {},
    sort: {
      "test.date": -1
    }
  }

  if (args.searchQuery) {
    query["search"]["value"] = args.searchQuery;
    query["search"]["fields"] = ["mapping.subject.name", "test.name", "mapping.textbook.name", "mapping.class.name"]
  }

  if (args.sortOrder === "asc") {
    query["sort"] = {
      "test.date": 1
    }
  }
  return query;

}

function getFileData(req){
	const workbook = xlsx.read(req.file.buffer, {
		type: 'buffer',
		cellDates: true
	  });

	// converting the sheet data to array of of objects
	const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{defval:""});
	// deleting empty string keys from all objects
	data.forEach((v) => {
		delete v[''];
	}); // eslint-disable-line

	// deleting all trailing empty rows
	for (let i = data.length - 1; i >= 0; i -= 1) {
		let values = Object.values(data[i]);
		values = values.map(x => x.toString());
		const vals = values.map(x => x.trim());
		if (vals.every(x => x === '')) data.pop();
		else break;
	}

	// trim and remove whitespace and changing keys to lower case
	data.forEach((obj) => {
		const keys = Object.keys(obj);
		for (let i = 0; i < keys.length; i += 1) {
			const key = keys[i];
			const lowerKey = key.toLowerCase();
			obj[lowerKey] = obj[key].toString().replace(/\s\s+/g, ' ').trim();
			if (key !== lowerKey) delete obj[key];
		}
	});
	return data;
}

export async function listTest(args, ctx) {
  try {
    const queries = queryForListTest(args);
    let find = {"mapping.textbook.code":{"$in": args.textbookCode}};
    
    if(args.active) {
      find["active"] = true;
    }

    if(args.active === false){
      find["active"] = false;
    }

    if(args.gaStatus){
      find["gaStatus"] = args.gaStatus
    }

    if(args.reviewed){
      find["reviewed"] = true;
    }

    if(args.reviewed === false){
      find["reviewed"] = false
    }

    let limit = args.limit ? args.limit : 0;
    let skip = args.pageNumber ? args.pageNumber - 1 : 0;
    const TestSchema = await Tests(ctx);
    let aggregateQuery  = [ {$match: find},{$sort:{updated_at: -1}},
      {$skip: skip * limit},
      { $lookup: { from: "testTimings", let: { testId: "$testId" },
       pipeline: [{ $match: { $expr: { $eq: ["$testId", "$$testId"] } } },
      { $group: { "_id": "$testId", maxDate: { $max: "$endTime" }, 
      minDate: { $min: "$startTime" }, maxDuration: { $max: "$duration" } } }, 
      { $project: { "endDate": "$maxDate", "startDate": "$minDate", "duration": "$maxDuration", "_id": 0 } }], as: "testTiming" } },
     { "$unwind": {"path": "$testTiming","preserveNullAndEmptyArrays": true} }]
    
    if(limit){
      aggregateQuery.splice(3,0,{$limit:limit});
    }
    const [data, count] = await Promise.all([
      TestSchema.aggregate(aggregateQuery).allowDiskUse(true), TestSchema.count(find)
    ])
    let response = {};
    response["data"] = data;
    response["pageInfo"] = {
      pageNumber: args.pageNumber,
      recordsShown: data.length,
      nextPage: limit !== 0 && limit * args.pageNumber < count,
      prevPage: args.pageNumber !== 1 && count > 0,
      totalEntries: count,
      totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
    }
    return response;
  } catch (err) {
    throw err;
  }
}

export async function listTextBooksWithTestSubectWise(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    let match = {
      "active": true,
      "mapping.textbook.code" : { "$in" : args.textbookCodes },
      "reviewed": true
    }
    if(ctx.dummy){
      delete match["reviewed"];
    }
    const list = await TestSchema.aggregate([{
      $match: match
    }, {
      $group: {
        "_id": "$mapping.textbook.code",
        count: {
          "$sum": 1
        }
      }
    }, {
      $project: {
        "textbookCode": "$_id",
        count: 1,
        "_id": 0
      }
    }, {
      $lookup: {
        from: "textbooks",
        localField: "textbookCode",
        foreignField: "code",
        as: "textbookInfo"
      }
    }, {
      $unwind: "$textbookInfo"
    }, {
      $project: {
        testCount: "$count",
        textbookCode: 1,
        name: "$textbookInfo.name",
        imageurl: "$textbookInfo.imageUrl"
      }
    }]).allowDiskUse(true);
    return list;
  } catch (err) {
    throw err;
  }
}

export async function getDashboardHeadersAssetCountV2(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
    header,
    gaStatus,
    active,
    reviewed
  } = args;
  let groupby = 'code';
  if(header === 'class') groupby = 'refs.class.code';
  else if (header === 'branch') groupby = 'branches';
  else if (header === 'orientation') groupby = 'orientations';
  else if (header === 'subject') groupby = 'refs.subject.code';

  const textbookAggregateQuery = [];

  const textbookMatchQuery = { active: true }
  if (classCode ) textbookMatchQuery['refs.class.code'] = classCode;
  if (subjectCode) textbookMatchQuery['refs.subject.code'] = subjectCode;
  if (textbookCode) textbookMatchQuery['code'] = textbookCode;
  if (branch) textbookMatchQuery['branches'] = { $in: [ branch, null ] };
  if (orientation) textbookMatchQuery['orientations'] = { $in: [ orientation, null ] };
  textbookAggregateQuery.push({ $match: textbookMatchQuery });

  if(header === 'branch') textbookAggregateQuery.push({$unwind: '$branches'})
  if(header === 'orientation') textbookAggregateQuery.push({$unwind: '$orientations'})

  const textbookGroupQuery = {
    $group: {
      _id: `$${groupby}`,
      textbookCodes: { $push: '$code' }
    }
  }
  textbookAggregateQuery.push(textbookGroupQuery);

  const [ Textbook, ContentMapping ] = await Promise.all([TextBook(context), Tests(context)]);
  const docs = await Textbook.aggregate(textbookAggregateQuery).allowDiskUse(true);

  if(!docs || !docs.length) return {};

  let textbookCodes = []
  docs.forEach(x => {
    textbookCodes = textbookCodes.concat(x.textbookCodes)
  })

  textbookCodes = Array.from(new Set(textbookCodes));

  const contentQuery = {
    'mapping.textbook.code': { $in: textbookCodes },
  };
  //const contentTypeMatchOrData = getContentTypeMatchOrData(contentCategory);
  // if(contentTypeMatchOrData.length) contentQuery['$or'] = contentTypeMatchOrData;
  
  if (chapterCode) contentQuery['mapping.chapter.code'] = chapterCode;
  if (gaStatus){
    contentQuery['gaStatus'] = "finished"
  }

  if(active){
    contentQuery["active"] = true;
  }
  if(active === false){
    contentQuery["active"] = false;
  }
  if(reviewed){
    contentQuery["reviewed"] = true;
  }
  if(reviewed === false){
    contentQuery["reviewed"] = false;
  }
  
  const aggregateQuery = []; 
  const contentMatchQuery = {
    $match: contentQuery,
  }
  groupby = 'mapping.textbook.code';
  if(header === 'chapter') groupby = 'mapping.chapter.code';
  aggregateQuery.push(contentMatchQuery);
  const contentGroupQuery = {
    $group: {
      _id: `$${groupby}`,
      count: { $sum: 1 },
    }
  }
  aggregateQuery.push(contentGroupQuery)
  const result = await ContentMapping.aggregate(aggregateQuery).allowDiskUse(true);
  if(!result || !result.length) return {};
  const objectifyResult = {};
  result.forEach(x => objectifyResult[x._id] = x.count)
  if(header === 'chapter') return objectifyResult;
  const finalData = {};
  docs.forEach(x => {
     finalData[x._id] = 0;
     x.textbookCodes.forEach(y => {
      finalData[x._id] += objectifyResult[y] || 0;
    });
  });
  return finalData;
}

export async function uploadTestMapping(req, res){
  try{
    if (!req.file) {
      return res.status(400).send({message: 'File required', error: true});
    }
    
    const fileName = req.file.originalname.split('.');
    const extname = fileName.pop()
    
    if (extname !== 'xlsx') {
      return res.status(400).send({message:'Invalid file extension, only xlsx is supported',error: true});
    }
    
    let data = getFileData(req);
    
    if(!data.length){
      return res.status(400).send({error: true,message:"Empty file."});
    }
    
    const headersInSheet = Object.keys(data[0]);
    const notFoundHeader = validateHeaders(headersInSheet, MAPPING_HEADERS)
    
    if(notFoundHeader.length){
      return res.status(400).send({error: true,message:"Invalid Headers",data: notFoundHeader});
    }
    const validateMappingSheet = validateMappingRows(data);
    
    if(validateMappingSheet.length){
      return res.status(400).send(
        {message: "Invalid row in the sheet",data: validateMappingSheet,error: true}
        );
    }
    const TestSchema = await Tests(req.user_cxt);
    
    const promiseSchema = await Promise.all([
      Chapter(req.user_cxt),TextBook(req.user_cxt),
      Hierarchy(req.user_cxt),Subject(req.user_cxt)
    ]);
    
    const ChapterSchema = promiseSchema[0];
    const TextBookSchema = promiseSchema[1];
    const HierarchySchema = promiseSchema[2];
    const SubjectSchema = promiseSchema[3];

    let textbook = new Set();
    let classs = new Set()
    let subject = new Set();
    let chapter = new Set();
    
    for(let i = 0 ; i < data.length ; i++){
      textbook.add(data[i]["textbook"]);
      classs.add(data[i]["class"]);
      subject.add(data[i]["subject"]);
      chapter.add(data[i]["chapter"]);
    }
    
    const textbooks = Array.from(textbook);
    const classes = Array.from(classs);
    const subjects = Array.from(subject);
    const chapters = Array.from(chapter);
    
    const promiseGetIndependentData = await Promise.all([
      HierarchySchema.find({levelName:"Class",child:{$in:classes},active:true})
      .select({_id:0,childCode:1,child: 1}).lean(),
      TextBookSchema.find({"refs.class.name":{$in: classes},"name":{$in: textbooks},"refs.subject.name":{$in: subjects}, active: true})
      .select({_id:0, orientations: 1, branches: 1,code:1, refs: 1,name: 1}).lean()
    ]);

    const classData = promiseGetIndependentData[0];
    const textbookData = promiseGetIndependentData[1];

    let classCodes = [];

    classData.forEach(obj => classCodes.push(obj.childCode));

    let textbookCodes = [];
    
    textbookData.forEach(textbook => {textbookCodes.push(textbook["code"]);});
    
    const promiseGetDependentData = await Promise.all([
      SubjectSchema.find({subject:{$in:subjects},active:true,"refs.class.code":{$in:classCodes}})
      .select({_id: 0, subject: 1,code: 1, "refs.class.code": 1}).lean(),
      ChapterSchema.find({"refs.textbook.code":{$in:textbookCodes},"child": {$in : chapters} , "levelName":"topic",active:true})
      .select({_id: 0, childCode: 1, child: 1, refs: 1}).lean()
    ]);

    const subjectsData = promiseGetDependentData[0];
    const chapterData = promiseGetDependentData[1];
    const validationCheck = await validateMappingDataFromDbDataAndCreateMap(data, chapterData, textbookData, classData, subjectsData);
    
    if(validationCheck.error){
      return res.status(400).send({message: "Invalid row in the sheet",data: validationCheck.erroredRow,error: true});
    }

    await TestSchema.bulkWrite(validationCheck.mapping);
    
    return res.status(200).send({error: false, message: "Success"});
  }catch(err){
    console.log(err)
    return res.status(500).send("internal server error");
  }
}

function validateHeaders(headersInSheet, _MAPPING_HEADERS){
  let obj = {}
  for(let i = 0; i < headersInSheet.length; i++){
      obj[headersInSheet[i]] = true
  }
  let headersNotFound = [];
  for(let j = 0 ; j < _MAPPING_HEADERS.length; j ++ ){
    if(!obj.hasOwnProperty(_MAPPING_HEADERS[j])){
      headersNotFound.push(_MAPPING_HEADERS[j].toUpperCase())
    }
  }
  return headersNotFound;
}
//["class","subject","textbook","chapter","content name","media type"]
function validateMappingRows (data){
  let errors = []
  let length = data.length
  for(let i = 0 ; i < length ; i++){
    let rowNumber = i+2;
    let errorDetails = [];
    if(!data[i]["class"]){
      errorDetails.push("CLASS not present")
    }
    if(!data[i]["subject"]){
      errorDetails.push("SUBJECT not present")
    }

    if(!data[i]["textbook"]){
      errorDetails.push("TEXTBOOK not present")
    }

    if(!data[i]["chapter"]){
      errorDetails.push("CHAPTER not present")
    }

    if(!data[i]["test name"]){
      errorDetails.push("TEST NAME not present")
    }

    if(errorDetails.length){
      errors.push("Row "+ rowNumber+ " : "+errorDetails.join(","))
    }
  }
  return errors;
}

async function validateMappingDataFromDbDataAndCreateMap(data, chapterData, textBookData, classData, subjectsData){
  try{
    const length = data.length;
    let error = false;
    let mapping = [];
    let erroredRow = [];
    const promise = await Promise.all([
      convertArrayOfChapterToObject(chapterData),
      convertArrayOfTextbookToObject(textBookData),
      classMapWithClassName(classData),
      subjectMapWithClassName(subjectsData, classData)
    ])
    const indexed_chapter = promise[0]
    const indexed_textbook = promise[1]
    const indexed_class = promise[2]
    const indexed_subject = promise[3]
    for (let i = 0 ; i< length ; i++){
      let rowNumber = i+2;
      if(!indexed_class.hasOwnProperty(data[i]["class"])){
        erroredRow.push("Row "+ rowNumber+ " : Invalid class")
        error = true;
        continue;
      }
  
      let _subjectKey = data[i]["subject"]+"_"+data[i]["class"];
  
      if(!indexed_subject.hasOwnProperty(_subjectKey)){
        erroredRow.push("Row "+ rowNumber+ " : Invalid subject")
        error = true;
        continue;
      }
  
      let _textbookKey = data[i]["textbook"]+"_"+data[i]["class"]+"_"+data[i]["subject"];
      if(!indexed_textbook.hasOwnProperty(_textbookKey)){
        erroredRow.push("Row "+ rowNumber+ " : Invalid textbook")
        error = true;
        continue;
      }
  
      let _chapterKey = data[i]["chapter"]+"_"+indexed_textbook[_textbookKey]["code"];
      
      if(!indexed_chapter.hasOwnProperty(_chapterKey)){
        erroredRow.push("Row "+ rowNumber+ " : Invalid chapter")
        error = true;
        continue;
      }
      if(!error){
        let testMapping = createTestMappingObject(data[i],indexed_class[data[i]["class"]],
        indexed_subject[_subjectKey],indexed_textbook[_textbookKey],
        indexed_chapter[_chapterKey])
        mapping.push(testMapping);
      }
    }
    return {error, mapping, erroredRow}
  }catch(err){
    throw err;
  }
  
}

async function convertArrayOfTextbookToObject(textbook){
  let textbookObj = {};
  let length = textbook.length;
  for(let i = 0 ; i < length ;i++){
    let textbookKey = textbook[i]["name"]+"_"+textbook[i]["refs"]["class"]["name"]+"_"+textbook[i]["refs"]["subject"]["name"];
    textbookObj[textbookKey] = textbook[i]
  }
  return textbookObj;
}

async function convertArrayOfChapterToObject(chapters){
  let chapterObj = {};
  let length = chapters.length;
  for(let i = 0 ; i < length ; i++){
    let chapterKey = chapters[i]["child"]+"_"+chapters[i]["refs"]["textbook"]["code"];
    chapterObj[chapterKey] = chapters[i];
  }
  return chapterObj;
}

async function classMapWithClassCode(classes){
  let classObj = {};
  let length = classes.length;
  for(let i = 0 ; i< length; i++){
    classObj[classes[i]["childCode"]] = classes[i];
  }
  return classObj;
}

async function classMapWithClassName(classes){
  let classObj = {};
  let length = classes.length;
  for(let i = 0 ; i< length; i++){
    classObj[classes[i]["child"]] = classes[i];
  }
  return classObj;
}

async function subjectMapWithClassName(subjects,classes){
  let subjectObj ={};
  const classMap = await classMapWithClassCode(classes);
  let length = subjects.length;
  for (let i = 0 ; i < length ; i++){
    let subjectKey = subjects[i]["subject"]+ "_" + classMap[subjects[i]["refs"]["class"]["code"]]["child"];
    subjectObj[subjectKey] = subjects[i];
  }
  return subjectObj;
}

function createTestMappingObject(data, classData, subjectData, textBookData, chapterData){
  let mapping = {
    "testId" : data["test id"] || uuidv4(),
    "testName" : data["test name"],
    "subjects" : [
        {
            "code" : subjectData.code,
            "parentCode" : textBookData.code,
            "subject" : data["subject"],
            "subjectCode" : subjectData.code
        }
    ],
    "mapping" : {
        "class" : {
            "code" : classData["childCode"],
            "name" : data["class"]
        },
        "subject" : {
            "code" : subjectData["code"],
            "name" : data["subject"]
        },
        "textbook" : {
            "code" : textBookData["code"],
            "name" : data["textbook"]
        },
        "chapter" : {
            "code" : chapterData["code"],
            "name" : data["chapter"]
        }
    },
    "branches" : textBookData["branches"],
    "orientations" : textBookData["orientations"],
    "test.name": data["test name"],
    "test.date": new Date(),
    "viewOrder" : data["view order"] || null,
    "reviewed": false
  }
  let upsertObj = {
    updateOne: {
        filter: {"testId":mapping["testId"] },
        update: {"$set": mapping},
        upsert: true,
        setDefaultsOnInsert: true
    }
  }
  return upsertObj;
}

export async function  uploadTestiming(req, res){
  try{
    if (!req.file) {
      return res.status(400).send({message: 'File required', error: true});
    }
    const testId = req.params.testId || null;
    
    if(!testId){
      return res.status(400).send({message: "Test Id missing.", error: true});
    }

    const fileName = req.file.originalname.split('.');
    const extname = fileName.pop()
    
    if (extname !== 'xlsx') {
      return res.status(400).send({message:'Invalid file extension, only xlsx is supported',error: true});
    }
    
    let data = getFileData(req);
    
    if(!data.length){
      return res.status(400).send({error: true,message:"Empty file."});
    }

    const headersInSheet = Object.keys(data[0]);
    const notFoundHeader = validateHeaders(headersInSheet, TEST_TIMING_HEADERS)
    
    if(notFoundHeader.length){
      return res.status(400).send({error: true,message:"Invalid Headers",data: notFoundHeader});
    }

    const validateTestTimingSheet = validateTestTimingRows(data);
    
    if(validateTestTimingSheet.length){
      return res.status(400).send(
        {message: "Invalid rows in the sheet",data: validateTestTimingSheet,error: true}
        );
    }
    
    let branchesArr = [];
    
    for(let i = 0 ; i < data.length; i++){
      data[i]["branches"] = data[i]["branches"].split(",");
      branchesArr = branchesArr.concat(data[i]["branches"]);
    }
    let branchObj = {};
    let duplicateBranches = [];
    
    branchesArr.forEach(function(branch){
      if(!branchObj.hasOwnProperty(branch)){
        branchObj[branch] = 1;
      }else{
        duplicateBranches.push(branch);
      }
    });

    if(duplicateBranches.length){
      return res.status(400).send({error: true, message: "Duplicate branches in the rows.", data: duplicateBranches});
    }

    const promiseSchema = await Promise.all([Tests(req.user_cxt),Hierarchy(req.user_cxt),
      TestTimings(req.user_cxt), TextBook(req.user_cxt)]);

    const TestSchema = promiseSchema[0];
    const HierarchySchema = promiseSchema[1];
    const TestTimingSchema = promiseSchema[2];
    const TextbookSchema = promiseSchema[3];

    const testInfo = await TestSchema.findOne({testId}).select({
      _id: 0,
      mapping : 1,
      test: 1,
      "gaSyncId": 1
    }).lean();

    if(!testInfo){
      return res.status(400).send({error: true, message: "Invalid test id."});
    }

    const testForBranches = await TextbookSchema.findOne({ code:testInfo.mapping.textbook.code, active: 1}).select({
      _id: 0,
      branches: 1
    });

    let invalidBranches = [];

    const testBranches = new Set(testForBranches["branches"]);
    branchesArr.forEach(function(brn){
      if(!testBranches.has(brn)){
        invalidBranches.push(brn)
      }
    });

    if(invalidBranches.length){
      return res.status(400).send({
        error: true,
        message: "invalid branches in sheet",
        data: [`Invalid branches in the sheet ${invalidBranches.join(",")}`]
      });
    }



    const branches = await HierarchySchema.find({
      "child": { $in: branchesArr },
      "anscetors.childCode" : testInfo.mapping.class.code,
      "levelName": "Branch"
    }).select({_id: 0, childCode: 1, child: 1}).lean();
    const validationCheck = validateTestTimingWithDbAndCreateMap(data, branches, testId, testInfo["mapping"]["class"]["name"]);
    if(validationCheck.error){
      return res.status(400).send({
        error: true,
        message: "invalid rows in db",
        data: validationCheck.erroredRow
      });
    }
    await TestTimingSchema.deleteMany({ testId });
    await TestTimingSchema.bulkWrite(validationCheck.mapping);
    let gaSyncId = null;
    if(testInfo.test.questionPaperId){
      const date = new Date(validationCheck.maxDate + validationCheck.maxDuration*60000)
      .toISOString().replace("T"," ").split(".")[0]
      .replace(/-/g,"/").substring(2);
      const data = {
        "date" : date,
        "function":"couch_to_mongo",
        "args" : {
          "test_id" : testId,
          "questionPaperId": testInfo.test.questionPaperId,
          "test_name": testInfo.test.name, 
          "tie_breaking_list":[],
          "studentId" : null
        }
      }
      if(testInfo.gaSyncId){
        await cancelGA({jobId: testInfo.gaSyncId},req.user_cxt)
      }
      const scheduledTask = await scheduleGA(data,req.user_cxt)
      gaSyncId = scheduledTask.job_id
    }
    await TestSchema.updateOne({testId},{$set:{gaSyncId,"gaStatus":null,reviewed: false}});
    return res.status(200).send({error: false, message: "Success"});
  }
  catch(err){
    console.log(err);
    return res.status(500).send("internal server error")
  }
}

//"branches","end date","start date","duration"
//start date and end date format(18/11/2019 - 17:00:00)
//duration is in minutes
function validateTestTimingRows (data){
  const timeBuff = 60 * 1000;
  const currentTime = new Date().getTime();
  let errors = []
  const length = data.length
  for(let i = 0 ; i < length ; i++){
    let startDate,endDate,dateDiffInMs;
    let rowNumber = i+2;
    let errorDetails = [];
    if(!data[i]["branches"] || !data[i]["branches"].split(",").length){
      errorDetails.push("Branches not present")
    }
    if(!data[i]["end date"]){
      errorDetails.push("End date not present")
    }else{
      endDate = convertToDateString(data[i]["end date"]);
      if(new Date(endDate) == "Invalid Date"){
        errorDetails.push("Invalid End date format.Format should be DD/MM/YYYY - HH:MM:SS");
      }else if( new Date(endDate).getTime() < currentTime ){
        errorDetails.push("Invalid End date.End date should be greater than current time");
      }else{
        data[i]["end date"] = endDate;
      }
    }

    if(!data[i]["start date"]){
      errorDetails.push("start date not present")
    }else{
      startDate = convertToDateString(data[i]["start date"]);
      if(new Date(startDate) == "Invalid Date"){
        errorDetails.push("Invalid start date format.Format should be DD/MM/YYYY - HH:MM:SS");
      }else if( new Date(startDate).getTime() < currentTime ){
        errorDetails.push("Invalid start date.Start date should be greater than current time");
      }else{
        data[i]["start date"] = startDate;
      }
    }
    if(startDate && endDate){
      dateDiffInMs  = new Date(endDate).getTime() - new Date(startDate).getTime();
      if(dateDiffInMs < 0){
        errorDetails.push("Start date should be less than End date.");
      }
    }
    if(!data[i]["duration"]){
      errorDetails.push("duration not present")
    }else{
      let durationInMsWithBuff = parseInt(data[i]["duration"]) * timeBuff ;
      if(dateDiffInMs < durationInMsWithBuff ){
        return errorDetails.push("Minimum difference between start date and end date should be equal to duration.")
      }
    }

    if(errorDetails.length){
      errors.push("Row "+ rowNumber+ " : "+errorDetails.join(","))
    }
  }
  return errors;
}

function convertToDateString(dateString){
  let l = dateString.trim().replace(/ /g,'');
  let a  = l.split("-");
  let b = a[0].split("/");
  let temp = b[0];
  b[0] = b[2];
  b[2] = temp;
  const IST_OFFSET = 19800000;
  const UTC_TIME = b.join("-")+"T"+a[1];
  let IST_TIME = new Date(UTC_TIME).getTime() - IST_OFFSET;
  return new Date(IST_TIME);
}

function branchMapOfName(branches){
  let branchMap = {}
  branches.forEach(function(branch){
    branchMap[branch["child"]] = branch;
  });
  return branchMap;
}

function validateTestTimingWithDbAndCreateMap(data, branches, testId, className){
  const length = data.length;
  let error = false;
  let mapping = [];
  let erroredRow = [];
  let maxDate = new Date().getTime();
  let maxDuration = 0
  const indexed_branch = branchMapOfName(branches);
  for( let i = 0 ; i < length ; i++ ){
    let rowNumber = i+2;
    let missingBranch = "";
    data[i]["branches"].forEach(function(branch){
      if(!indexed_branch.hasOwnProperty(branch)){
        error = true;
        missingBranch += branch + ", ";
      }
    });
    if(missingBranch.length){
      erroredRow.push("Row "+ rowNumber+ " : Invalid Branch "+ missingBranch)
    }
    if(!error){
      createTimingMap(data[i], indexed_branch, mapping, testId, className, maxDate, maxDuration);
    }
  }
  return {error, mapping, erroredRow, maxDuration, maxDate}
}

function createTimingMap(data, indexed_branch, ret_data, testId, className, maxDate, maxDuration){
  const branches = data["branches"];
  let dateInMilis = new Date(data["end date"]).getTime(); 
  if(dateInMilis > maxDate){
    maxDate = dateInMilis;
  }

  if(data["duration"] >  maxDuration){
    maxDuration = data["duration"]
  }

  branches.forEach(function(branch){
    let mapping = {
      testId: testId,
      _id: indexed_branch[branch]["childCode"]+"_"+testId,
      startTime: new Date(data["start date"]),
      endTime: new Date(data["end date"]),
      duration: parseInt(data["duration"]),
      class: className,
      orientations: data["orientations"] ? data["orientations"].split(",") : [],
      hierarchyId: indexed_branch[branch]["childCode"]
    }
    let upsertObj = {
      updateOne: {
          filter: { "_id": mapping["_id"] },
          update: {"$set": mapping},
          upsert: true,
          setDefaultsOnInsert: true
      }
    }
    ret_data.push(upsertObj);
  });
  return true;
}

export async function publishTest(req, res){
  try{
    const { questionPaperId, testId } = req.body;
  
    if(!questionPaperId || !testId){
      return res.status(400).send("Bad_Args");
    }
  
    const [TestTimingSchema,QuestionsSchema,TestSchema] = await Promise.all([
      TestTimings(req.user_cxt),Questions(req.user_cxt),Tests(req.user_cxt)]);
    const [testTiming, questionsCount] = await Promise.all([
      TestTimingSchema.aggregate([{$match: {testId}},
      {$group: {"_id": "$testId",maxDate: {$max: "$endTime"},minDate: {$min: "$startTime"},maxDuration: {$max: "$duration"}}},
      {$lookup:{from: "tests", foreignField: "testId", "localField": "_id","as": "testInfo"}},
      {$unwind: "$testInfo"},
      {$project:{subject: "$testInfo.mapping.subject.name",testName: "$testInfo.test.name",maxDuration: 1,maxDate: 1, minDate: 1,gaSyncId: "$testInfo.gaSyncId"}}]).allowDiskUse(true),
      QuestionsSchema.count({questionPaperId})
    ]);
    if(!testTiming.length){
      return res.status(400).send("Test timing not uploaded yet.");
    }
    if(new Date(testTiming[0]["maxDate"]).getTime() <= new Date().getTime()){
      return res.status(409).send("You cannot update the test as test has already started.");
    }
    if(!questionsCount){
      return res.status(400).send("Invalid question paper id.");
    }
  
    const setObject = {
      "test.questionPaperId": questionPaperId,
      "active": true,
      "subject.0.totalQuestions": questionsCount,
      "markingSchema": {
        "totalQuestions" : questionsCount,
        "totalMarks" : questionsCount,
        "subjects" : [
          {
            "tieBreaker" : 1,
            "start" : 1,
            "end" : questionsCount,
            "subject" : testTiming[0]["subject"],
            "totalQuestions" : questionsCount,
            "totalMarks" : questionsCount,
            "marks" : [
              {
                "noOfOptions" : 4,
                "numberOfSubQuestions" : questionsCount,
                "P" : 0,
                "ADD" : 1,
                "questionType" : "Single Answer",
                "egnifyQuestionType" : "Single answer type",
                "numberOfQuestions" : questionsCount,
                "section" : null,
                "C" : 1,
                "W" : 0,
                "U" : 0,
                "start" : 1,
                "end" : questionsCount,
                "totalMarks" : questionsCount
              }
            ]
          }
        ]
      },
      "coins": questionsCount,
      "questionPaperId": questionPaperId,
      "reviewed": false,
      "gaStatus":null
    }
    const gaDate = new Date(new Date(testTiming[0]["maxDate"]).getTime() + testTiming[0]["maxDuration"]*60000);

    const date = gaDate.toISOString().replace("T"," ").split(".")[0].replace(/-/g,"/").substring(2);
  
    const data = {
      "date" : date,
      "function":"couch_to_mongo",
      "args" : {
        "test_id" : testId,
        "questionPaperId": questionPaperId,
        "test_name": testTiming[0]["testName"], 
        "tie_breaking_list":[],
        "studentId" : null
      }
    }
    const scheduledTask = await scheduleGA(data,req.user_cxt);
    setObject["gaSyncId"] = scheduledTask.job_id
    setObject["gaDate"] = new Date(gaDate);
    const oldData = await TestSchema.findOneAndUpdate({testId},{$set: setObject});
    if(testTiming[0]["gaSyncId"]){
      await cancelGA({jobId: testTiming[0]["gaSyncId"]},req.user_cxt)
    }
    if(oldData.questionPaperId){
      await QuestionsSchema.deleteMany({questionPaperId:oldData.questionPaperId});
    }
    return res.status(200).send("Test Saved Successfully.");
  }catch(err){
    console.error(err)
    return res.status(500).send("internal server error.");
  }
}

async function scheduleGA(data, user_cxt){
  try{
    const headers = {
      "accesscontroltoken": user_cxt["token"]["accesscontroltoken"],
      "authorization": user_cxt["token"]["authorization"]
    }
    const url = GA_SCHEDULER_URL
    const res = await axios({ method: "POST", url, data , headers });
    return res.data;
  }catch(err){
    throw err;
  }
}

async function cancelGA(data,user_cxt){
  try{
    const headers = {
      "accesscontroltoken": user_cxt["token"]["accesscontroltoken"],
      "authorization": user_cxt["token"]["authorization"]
    }
    const url = `${GA_SCHEDULER_URL}/${data.jobId}/cancel`;
    await axios({ method: "POST", url, data , headers });
  }catch(err){
    throw err;
  }
}

export async function getCMSTestStats(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
    gaStatus,
    reviewed,
    active
  } = args;

  // Textbook data;
  const textbookMatchQuery = { active: true }
  if (classCode ) textbookMatchQuery['refs.class.code'] = classCode;
  if (subjectCode) textbookMatchQuery['refs.subject.code'] = subjectCode;
  if (textbookCode) textbookMatchQuery['code'] = textbookCode;
  if (branch) textbookMatchQuery['branches'] = { $in: [ branch, null ] };
  if (orientation) textbookMatchQuery['orientations'] = { $in: [ orientation, null ] };


  const [ TextbookSchema, TestSchema ] = await Promise.all([TextBook(context), Tests(context)]);
  const docs = await TextbookSchema.find(textbookMatchQuery,{_id: 0, code: 1, 'refs.class.code': 1 })
  if(!docs || !docs.length) return [];
  // return docs;
  const objectifyDocs = {};
  docs.forEach(x => objectifyDocs[x.code] = x.refs.class.code);
  let textbookCodes = docs.map(x => x.code);

  // Content mapping
  const contentAggregateQuery = [];
  const contentMatchQuery = { active: true }
  if(gaStatus){
    contentMatchQuery["gaStatus"] = "finished";
  }
  if(reviewed){
    contentMatchQuery["reviewed"] = true;
  }
  if(active === false){
    contentMatchQuery["active"] = false;
  }

  if(reviewed === false){
    contentMatchQuery["reviewed"] = false;
  }
  // const contentTypeMatchOrData = getContentTypeMatchOrData("");
  // if(contentTypeMatchOrData.length) contentMatchQuery['$or'] = contentTypeMatchOrData;
  contentMatchQuery['mapping.textbook.code'] = { $in: textbookCodes };
  if(chapterCode) contentMatchQuery['mapping.chapter.code'] = chapterCode;
  contentAggregateQuery.push({$match: contentMatchQuery});
  // return contentMatchQuery;
  const contentGroupQuery = {
    _id: {
      textbookCode: '$mapping.textbook.code',
    }, count: { $sum: 1 }
  }
  contentAggregateQuery.push({$group: contentGroupQuery });
  const data = await TestSchema.aggregate(contentAggregateQuery).allowDiskUse(true);
  const tempData = {}
  data.forEach(x => {
      const classCode = objectifyDocs[x._id.textbookCode]; 
      const category = x._id.category;
      if(!tempData[classCode]) tempData[classCode] = {};
      if(!tempData[classCode][category]) tempData[classCode][category] = 0;
      tempData[classCode][category] += x.count;
  })
  // return tempData;
  const finalData = [];
  for(let temp in tempData){
    for(let key in tempData[temp]){
      finalData.push({classCode: temp, category:"Test", count: tempData[temp][key]})
    }
  }
  return finalData;
}

export async function testAnalysis(args, context) {
  try {
      const [TestMasterResultSchema, QuestionSchema, TestTimingSchema] = await Promise.all([
          MasterResult(context), Questions(context), TestTimings(context)
      ]);
      let {
          testId,
          studentId,
          limit,
          skip
      } = args;
      skip = skip || 0;
      limit = limit || 0;
      var dumpingArray = []
      const aggregatePipeline = [{
              $skip: skip
          },
          {
              $lookup: {
                  "from": "tests",
                  "localField": "testId",
                  "foreignField": "testId",
                  "as": "testInfo"
              }
          }, {
              $unwind: "$testInfo"
          },
          {
              $lookup: {
                  "from": "studentInfo",
                  "localField": "studentId",
                  "foreignField": "studentId",
                  "as": "studentInfo"
              }
          },
          {
              "$unwind": "$studentInfo"
          }
      ]
      const countQuery = [{
              $lookup: {
                  "from": "tests",
                  "localField": "testId",
                  "foreignField": "testId",
                  "as": "testInfo"
              }
          }, {
              $unwind: "$testInfo"
          },
          {
              $lookup: {
                  "from": "studentInfo",
                  "localField": "studentId",
                  "foreignField": "studentId",
                  "as": "studentInfo"
              }
          },
          {
              "$unwind": "$studentInfo"
          }, {
              $group: {
                  _id: {
                      "studentId": "$studentInfo.studentId",
                      "testId": "$testInfo.testId"
                  },
                  count: {
                      $sum: 1
                  }
              }
          },
          {
              $project: {
                  _id: 0,
                  count: 1
              }
          }
      ]
      let orOperator = []
      args.accessibleBranches.forEach(branch=>{
        let key = `hierarchyLevels.${branch}`
        orOperator.push({ [key]: {"$exists": true}})
      })

      let matchQuery = {
          $match: {
            "$or":orOperator
          }
      }

      let project = {
          $project: {
              "studentId": 1,
              "name": 1,
              "testInfo.test.questionPaperId": 1,
              "testInfo.mapping.subject.name": 1,
              "testInfo.markingSchema.totalQuestions": 1,
              "testInfo.test.name": 1,
              "testInfo.mapping.textbook.name": 1,
              "responseData.questionResponse": 1,
              "studentInfo.hierarchy": 1,
              "cwuAnalysis": 1,
              "studentInfo.orientation": 1,
              "testId": 1
          }
      }
      if (testId && testId.length) {
          matchQuery["$match"]["testId"] = testId
      }
      if (studentId && studentId.length) {
          matchQuery["$match"]["studentId"] = studentId
      }
      if (Object.keys(matchQuery["$match"]).length) {
          aggregatePipeline.unshift(matchQuery);
          countQuery.unshift(matchQuery);
      }
      if (limit) {
          aggregatePipeline.splice(2, 0, {
              $limit: limit
          })
      }
      aggregatePipeline.push(project);
      const [studentAnalysis, count] = await Promise.all([
          TestMasterResultSchema.aggregate(aggregatePipeline).allowDiskUse(true),
          TestMasterResultSchema.aggregate(countQuery).allowDiskUse(true)
      ])
      if (!studentAnalysis || !studentAnalysis.length) {
          return [];
      }
      let questionPaperIds = {}
      studentAnalysis.forEach((studentData) => {
          questionPaperIds[studentData["testInfo"]["test"]["questionPaperId"]] = true
      });
      let questionPaperIdsArray = Object.keys(questionPaperIds);
      let questionsArray = await QuestionSchema.aggregate([{
          $match: {
              questionPaperId: {
                  $in: questionPaperIdsArray
              }
          }
      }, {
          $group: {
              "_id": "$questionPaperId",
              "questions": {
                  $push: {
                      "qno": "$qno",
                      "revised_blooms_taxonomy": "$revised_blooms_taxonomy"
                  }
              }
          }
      }]).allowDiskUse(true)
      let branchesOfStudentsWithTestId = new Set();
      studentAnalysis.forEach( (analysis) => {
        branchesOfStudentsWithTestId.add(analysis["studentInfo"]["hierarchy"][4]["childCode"]+"_"+analysis["testId"])
      })
      
      branchesOfStudentsWithTestId = Array.from(branchesOfStudentsWithTestId);

      const testTiming = await TestTimingSchema.find({_id: {$in:branchesOfStudentsWithTestId}}).select({startTime: 1, endTime: 1}).lean();
      const indexed_test_timing_map = testTimingToMap(testTiming);
      let questionPaperIndex = questionPaperIdToIndex(questionsArray);
      for (let i = 0; i < studentAnalysis.length; i++) {
          let data = totalTimeSpentQuestionWise(studentAnalysis[i]["responseData"]["questionResponse"]);
          let hierarchyId = studentAnalysis[i]["studentInfo"]["hierarchy"][4]["childCode"];
          let testId = studentAnalysis[i]["testId"]
          let analysisObject = {
              "studentId": studentAnalysis[i]["studentId"],
              "studentName": studentAnalysis[i]["name"],
              "branchName": studentAnalysis[i]["studentInfo"]["hierarchy"][4]["child"],
              "class": studentAnalysis[i]["studentInfo"]["hierarchy"][1]["child"],
              "section": studentAnalysis[i]["studentInfo"]["hierarchy"][5]["child"],
              "subject": studentAnalysis[i]["testInfo"]["mapping"]["subject"]["name"],
              "testName": studentAnalysis[i]["testInfo"]["test"]["name"],
              "totalNumberOfQuestions": studentAnalysis[i]["testInfo"]["markingSchema"]["totalQuestions"],
              "cwuDetailsInGroupOfDifficulty": cwuDetailsInGroupOfDifficulty(studentAnalysis[i]),
              "timeSpentOnEachQuestion": data.timeSpent,
              "questionWiseCwu": data.marksObtained,
              "totalMarksObtianed": studentAnalysis[i]["cwuAnalysis"]["overall"]["C"],
              "totalMarksObtainedByApplication": totalMarksObtainedGrouped(studentAnalysis[i], questionsArray[questionPaperIndex[studentAnalysis[i]["testInfo"]["test"]["questionPaperId"]]]["questions"], "Application", "revised_blooms_taxonomy"),
              "totalMarksObtainedByKnowledge": totalMarksObtainedGrouped(studentAnalysis[i], questionsArray[questionPaperIndex[studentAnalysis[i]["testInfo"]["test"]["questionPaperId"]]]["questions"], "Knowledge", "revised_blooms_taxonomy"),
              "totalMarksObtainedByInference": totalMarksObtainedGrouped(studentAnalysis[i], questionsArray[questionPaperIndex[studentAnalysis[i]["testInfo"]["test"]["questionPaperId"]]]["questions"], "Inference", "revised_blooms_taxonomy"),
              "textbook": studentAnalysis[i]["testInfo"]["mapping"]["textbook"]["name"],
              "Correct": studentAnalysis[i]["cwuAnalysis"]["overall"]["C"],
              "Wrong": studentAnalysis[i]["cwuAnalysis"]["overall"]["W"] + studentAnalysis[i]["cwuAnalysis"]["overall"]["P"],
              "Unattempted": studentAnalysis[i]["cwuAnalysis"]["overall"]["U"],
              "orientation": studentAnalysis[i]["studentInfo"]["orientation"],
              "city": studentAnalysis[i]["studentInfo"]["hierarchy"][3]["child"],
              "startTime": indexed_test_timing_map.hasOwnProperty(hierarchyId+"_"+testId) ? indexed_test_timing_map[hierarchyId+"_"+testId]["startTime"] : "NOT_MAPPED",
              "endTime":  indexed_test_timing_map.hasOwnProperty(hierarchyId+"_"+testId) ? indexed_test_timing_map[hierarchyId+"_"+testId]["endTime"] : "NOT_MAPPED"
          }
          dumpingArray.push(analysisObject)
      }
      return {
          "studentAnalysis": dumpingArray,
          count: count.length
      };
  } catch (err) {
      console.log(err)
      throw err;
  }
}

function testTimingToMap(testTiming){
  let retObj = {};
  testTiming.forEach((data)=>{
    retObj[data["_id"]] = data
  });
  return retObj;
}

function questionPaperIdToIndex(questions){
	let ret_obj = {};
	for(let i = 0 ; i < questions.length ; i++){
		ret_obj[questions[i]["_id"]] = i
	}
	return ret_obj;
}

//[ "Easy", "Medium", "Hard", "Difficult", "EASY", "MEDIUM", "HARD" ]
function cwuDetailsInGroupOfDifficulty(data){
	let difficulty = {"easy": {"C":0,"W":0,"U":0} ,"medium":{"C":0,"W":0,"U":0}, "hard" : {"C":0,"W":0,"U":0}, "difficult":{"C":0,"W":0,"U":0}}
	for ( let key in data["responseData"]["questionResponse"]){
		if([ "Easy", "Medium", "Hard", "Difficult", "EASY", "MEDIUM", "HARD" ].includes(data["responseData"]["questionResponse"][key]["difficulty"])){
			if(data["responseData"]["questionResponse"][key].hasOwnProperty("C")){
				difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["C"] = difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["C"] + 1;
			}
			if(data["responseData"]["questionResponse"][key].hasOwnProperty("W")){
				difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["W"] = difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["W"] + 1
			}
			if(data["responseData"]["questionResponse"][key].hasOwnProperty("U")){
				difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["U"] = difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["U"] + 1
			}
		}
	}
	return difficulty;
}

function totalMarksObtainedGrouped(data,  question , groupBy, type){
	let marksObtained = 0;
	let groupByquestions = {};
	let questions = JSON.parse(JSON.stringify(question))
	for (let i = 0 ; i < questions.length ; i++){
		if(!questions[i][type]){
			return "NOT_MAPPED"
		}
		if(questions[i][type].toLowerCase() === groupBy.toLowerCase()){
			groupByquestions[questions[i]["qno"]] = true;
		}
	}
	for ( let qno in groupByquestions){
		if(data["responseData"]["questionResponse"][qno].hasOwnProperty("C")){
			marksObtained = marksObtained + 1
		}
	}
	return marksObtained;
}

function totalTimeSpentQuestionWise(questionResponse){
	let timeSpent = {};
	let marksObtained = {
		"correct": [],
		"wrong": [],
		"unattempted": []	
	}
	for(let qno in questionResponse){
		timeSpent[qno] = questionResponse[qno]["timespent"];
		if(questionResponse[qno].hasOwnProperty("C")){
			marksObtained.correct.push(qno);
		}
		if(questionResponse[qno].hasOwnProperty("W")){
			marksObtained.wrong.push(qno);
		}

		if(questionResponse[qno].hasOwnProperty("U")){
			marksObtained.unattempted.push(qno);
		}
	}
	return {timeSpent, marksObtained};
}

export async function getTestCompletionStats(req, res){
  try{
    let { Branch, Orientation , Class, limit, skip } = req.query;
    let getQuery = {
      "numberOfTests":{$gt: 0}
    }
    if(Branch){
        getQuery["branch"] = Branch
    }
    if(Orientation){
        getQuery["orientation"] = Orientation
    }
    if(Class){
        getQuery["class"] = Class
    }
    limit = parseInt(limit) ? limit : 0;
    skip = parseInt(skip) ? skip : 0;
    limit = parseInt(limit)
    skip = parseInt(skip)
    const TestSummary = await TestSummarySchema(req.user_cxt);
    const [result,count] = await Promise.all([
        TestSummary.find(getQuery).skip(skip).limit(limit).lean(),
        TestSummary.count(getQuery)])
    return res.status(200).send({result,count})
  }catch(err){
    console.log(err);
    return res.status(500).send("internal server error");
  }
}

export async function getStudentWiseTestStats(req, res){
  try{
      let { Branch, Class, Orientation, Section, limit, skip} = req.query;
      limit = parseInt(limit) ? limit : 0;
      skip = parseInt(skip) ? skip : 0;
      limit = parseInt(limit)
      skip = parseInt(skip)
      if( !Branch || !Class || !Orientation){
          return res.status(400).send("Bad Req.")
      }
      let aggregateQuery = [
          {
              "$lookup":{
                  "from": "test_masterresults",
                  "let": { studentId: "$studentId"},
                  "pipeline": [
                      {
                          "$match": {
                              "$expr":{
                                  "$eq": ["$studentId", "$$studentId"]
                              }
                          }
                      },
                      {
                          "$group":{
                              "_id": {
                                  "studentId": "$studentId",
                                  "testId": "$testId"
                              }
                          }
                      }
                  ],		
                  "as": "testInfo"
              }
          },{
              "$project":{
                  "studentId": 1,
                  "class": "$hierarchyLevels.L_2",
                  "branch": "$hierarchyLevels.L_5",
                  "orientation": 1,
                  "section": "$hierarchyLevels.L_6",
                  "attemptedTest": {
                      $cond: {
                          if: {
                              $isArray: "$testInfo"
                          },
                          then: {
                              $size: "$testInfo"
                          },
                          else: 0
                      }
                  },
                  studentName: 1,
                  _id: 0
              }
          }
      ];
      let matchQuery = {
          "$match":{
              "orientation": Orientation,
              "hierarchyLevels.L_5": Branch,
              "hierarchyLevels.L_2": Class,
              "active": true
          }
      }
      if(Section){
          matchQuery["$match"]["hierarchyLevels.L_6"] = Section; 
      }
      aggregateQuery.splice(0,0,matchQuery);
      aggregateQuery.splice(1,0,{$skip: skip})
      if(limit){
          aggregateQuery.splice(2,0,{$limit: limit});
      }

      const StudentInfo = await StudentInfoSchema(req.user_cxt);
      let [results,count] = await Promise.all([
          StudentInfo.aggregate(aggregateQuery).allowDiskUse(true),
          StudentInfo.count(matchQuery["$match"])
      ]);
      return res.status(200).send({ results, count});        
  }catch(err){
      console.log(err);
      return res.status(500).send("internal server error");
  }
}

export async function makeLive(req, res){
  try{
    if(!req.body.testIds){
      return res.status(400).send("Test id missing in req.");
    }
    const testIds = req.body.testIds.split(",");
    const TestSchema = await Tests(req.user_cxt);
    await TestSchema.update({ testId: {$in : testIds}},{
      $set: {
        reviewed: true,
        active: true
      }
    },{multi: true});
    return res.status(200).send("Success");
  }catch(err){
    console.error(err);
    return res.status(500).send("internal server error");
  }
}

export async function testDetails(req, res){
  try{
    const testId = req.params.testId;
    const TestSchema = await Tests(req.user_cxt);
    let data = await TestSchema.aggregate([{
      $match: {
        testId: testId
      }},{
        $lookup:{
          from: "textbooks",
          localField: "mapping.textbook.code",
          foreignField: "code",
          as: "textbook"
        }
      },{$unwind:"$textbook"},
      {
        $project:{
          "class": "$textbook.refs.class",
          "branches": "$textbook.branches",
          "orientation": "$textbook.orientations",
          "subject": "$textbook.refs.subject",
          "chapter": "$mapping.chapter",
          "test": 1,
          "_id": 0
        }
      }
    ]).allowDiskUse(true);
    return res.status(200).send(data);
  }catch(err){
    console.error(err);
    return res.status(500).send("internal server error.")
  }
}

export async function deletetests(req, res){
  try{
    if(!req.body.testIds){
      return res.status(400).send("Test ids missing.")
    }
    
    const testIds = req.body.testIds.split(",");
    const SchemaPromise = await Promise.all([
      Tests(req.user_cxt),TestTimings(req.user_cxt)
    ])

    const TestSchema = SchemaPromise[0];
    const TestTimingSchema = SchemaPromise[1];

    let testTimings = await TestTimingSchema.aggregate(
      [
        {
          $match:{
            testId: {$in: testIds}
          }
        },
        {
          $group:{
            "_id":"$testId",
            "minDate":{"$min":"$startTime"},
          }
        }
      ]
    ).allowDiskUse(true);
    
    let testIdsToDelete =[];
    testTimings.forEach((testObj) => {
      if(new Date(testObj.minDate).getTime() > new Date().getTime()){
        testIdsToDelete.push(testObj["_id"]);
      }
    })

    testIds.forEach((testId)=>{
      let index = testTimings.findIndex((obj)=>{
        return obj["_id"] === testId
      })
      if(index === -1){
        testIdsToDelete.push(testId)
      }
    })

    await TestSchema.deleteMany({testId: {$in: testIdsToDelete}})
    return res.status(200).send("Success");
  }catch(err){
    console.error(err);
    return res.status(500).send("internal server error");
  }
}