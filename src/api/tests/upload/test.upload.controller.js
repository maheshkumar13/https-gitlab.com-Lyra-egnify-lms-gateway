import {
  getModel as Tests
} from './test.model';

import {
  getModel as TextBook
} from '../../settings/textbook/textbook.model';
const xlsx = require('xlsx');
import {getModel as Questions} from '../questions/questions.model';

import {
  getModel as Chapter
} from '../../settings/conceptTaxonomy/concpetTaxonomy.model'

import {
  getModel as TestTimings
} from '../testTiming/testtiming.model'

const uuidv4 = require("uuid/v4");
import {getModel as Hierarchy} from '../../settings/instituteHierarchy/instituteHierarchy.model';
import {getModel as Subject} from '../../settings/subject/subject.model';
import {getModel as MasterResult } from './masterresults.model';

const MAPPING_HEADERS = ["class","subject","textbook","chapter","test name","view order"]
const SUPPORTED_MEDIA_TYPE = ["docx","xlsx","xml"];
const TEST_TIMING_HEADERS = ["branches","end date","start date","duration"];

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
    let activeStatus = true;
    if(args.active === false) {
      activeStatus = false
    } 
    let find = {"mapping.textbook.code":{"$in": args.textbookCode}, active: activeStatus};
    if(args.gaStatus){
      find["gaStatus"] = args.gaStatus
    }
    const TestSchema = await Tests(ctx);
    let limit = args.limit ? args.limit : 0;
    let skip = args.pageNumber ? args.pageNumber - 1 : 0;
    let data = await TestSchema.dataTables({
      limit: limit,
      skip: skip * limit,
      find: find,
      search: queries.search,
      sort: queries.sort,
    });

    data["pageInfo"] = {
      pageNumber: args.pageNumber,
      recordsShown: data["data"].length,
      nextPage: limit !== 0 && limit * args.pageNumber < data["total"],
      prevPage: args.pageNumber !== 1 && data["total"] > 0,
      totalEntries: data["total"],
      totalPages: limit > 0 ? Math.ceil(data["total"] / limit) : 1,
    }

    return data
  } catch (err) {
    throw err;
  }
}

export async function listTextBooksWithTestSubectWise(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    const list = await TestSchema.aggregate([{
      $match: {
        "active": true,
        "mapping.textbook.code" : { "$in" : args.textbookCodes }
      }
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
    }]);
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
    header
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
    active: true,
    'mapping.textbook.code': { $in: textbookCodes },
  };
  //const contentTypeMatchOrData = getContentTypeMatchOrData(contentCategory);
  // if(contentTypeMatchOrData.length) contentQuery['$or'] = contentTypeMatchOrData;
  
  if (chapterCode) contentQuery['mapping.chapter.code'] = chapterCode;
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

    "markingSchema" : {
        "subjects" : [
            {
                "tieBreaker" : 1,
                "start" : 1,
                "subject" : data["subject"],
                "marks" : [
                    {
                        "noOfOptions" : 4,
                        "P" : 0,
                        "ADD" : 1,
                        "questionType" : "Single Answer",
                        "egnifyQuestionType" : "Single answer type",
                        "C" : 1,
                        "W" : 0,
                        "U" : 0,
                        "start" : 1,
                    }
                ]
            }
        ]
    },
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
    "test" : {
        "startTime" : new Date(),
        "endTime" : new Date(),
        "date" : new Date(),
        "name" : data["test name"]
    },
    "viewOrder" : data["view order"] || null
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
      TestTimings(req.user_cxt)]);

    const TestSchema = promiseSchema[0];
    const HierarchySchema = promiseSchema[1];
    const TestTimingSchema = promiseSchema[2]

    const testInfo = await TestSchema.findOne({testId}).select({
      _id: 0,
      mapping : 1,
      test: 1
    }).lean();

    if(!testInfo){
      return res.status(400).send({error: true, message: "Invalid test id."});
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
    await TestTimingSchema.bulkWrite(validationCheck.mapping);
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
  const timeBuff = 60 * 1000 * 2;
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
      if(dateDiffInMs <= durationInMsWithBuff ){
        return errorDetails.push("Minimum difference between start date and end date should be 3hrs plus duration.")
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
  b[2] = temp
  return b.join("-")+"T"+a[1];
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
      createTimingMap(data[i], indexed_branch, mapping, testId, className);
    }
  }
  return {error, mapping, erroredRow}
}

function createTimingMap(data, indexed_branch, ret_data, testId, className){
  const branches = data["branches"];
  branches.forEach(function(branch){
    let mapping = {
      testId: testId,
      _id: indexed_branch[branch]["childCode"]+"_"+testId,
      startTime: new Date(data["start date"]),
      endTime: new Date(data["end date"]),
      duration: parseInt(data["duration"]),
      class: className,
      orientations: data["orientations"] ? data["orientations"].split(",") : []
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

export async function getCMSTestStats(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
    gaStatus
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

export async function testAnalysis(args, context){
  try{
    const [TestMasterResultSchema, QuestionSchema] = await Promise.all([
      MasterResult(context), Questions(context)
    ]);
    let {testId,studentId,limit,skip} = args;
    skip = skip || 0;
    limit = limit || 0;
    var dumpingArray = []
		const aggregatePipeline = [
			{$skip: skip },
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
		let matchQuery = {$match:{}}
		let project = {$project:{
			"studentId": 1,
			"name": 1,
			"testInfo.test.questionPaperId": 1,
			"testInfo.mapping.subject.name": 1,
			"testInfo.markingSchema.totalQuestions": 1,
			"testInfo.test.name": 1,
			"testInfo.mapping.textbook.name": 1,
			"responseData.questionResponse": 1,
			"studentInfo.hierarchy": 1,
			"cwuAnalysis" : 1
		}}
		if(testId && testId.length){
			matchQuery["$match"]["testId"] = testId
		}
		if(studentId && studentId.length){
			matchQuery["$match"]["studentId"] = studentId
		}
		if(Object.keys(matchQuery["$match"]).length){
			aggregatePipeline.unshift(matchQuery);
    }
    if(limit){
      aggregatePipeline.splice(2,0,{$limit: limit})
    }
    aggregatePipeline.push(project);
		const studentAnalysis = await TestMasterResultSchema.aggregate(aggregatePipeline).allowDiskUse(true)
    if(!studentAnalysis || !studentAnalysis.length){
      return [];
    }
    let questionPaperIds = {}
		studentAnalysis.forEach((studentData)=>{
			questionPaperIds[studentData["testInfo"]["test"]["questionPaperId"]] = true
    });
		let questionPaperIdsArray = Object.keys(questionPaperIds);
		let questionsArray = await QuestionSchema.aggregate([{$match:{questionPaperId : {$in: questionPaperIdsArray}}},{ $group: { "_id": "$questionPaperId", "questions": { $push: { "qno": "$qno", "revised_blooms_taxonomy": "$revised_blooms_taxonomy" } } } }]).allowDiskUse(true)
		let questionPaperIndex = questionPaperIdToIndex(questionsArray);
		for ( let i = 0 ; i < studentAnalysis.length ; i++){
			let data = totalTimeSpentQuestionWise(studentAnalysis[i]["responseData"]["questionResponse"]);
			let analysisObject = {
				"studentId": studentAnalysis[i]["studentId"],
				"studentName" : studentAnalysis[i]["name"],
				"branchName" : studentAnalysis[i]["studentInfo"]["hierarchy"][4]["child"],
				"class" : studentAnalysis[i]["studentInfo"]["hierarchy"][1]["child"],
				"section" : studentAnalysis[i]["studentInfo"]["hierarchy"][5]["child"],
				"subject" : studentAnalysis[i]["testInfo"]["mapping"]["subject"]["name"],
				"testName" : studentAnalysis[i]["testInfo"]["test"]["name"],
				"totalNumberOfQuestions" : studentAnalysis[i]["testInfo"]["markingSchema"]["totalQuestions"],
				"cwuDetailsInGroupOfDifficulty" : cwuDetailsInGroupOfDifficulty(studentAnalysis[i]),
				"timeSpentOnEachQuestion" : data.timeSpent,
				"questionWiseCwu": data.marksObtained,
				"totalMarksObtianed" : studentAnalysis[i]["cwuAnalysis"]["overall"]["C"],
				"totalMarksObtained(Application)" : totalMarksObtainedGrouped(studentAnalysis[i],questionsArray[questionPaperIndex[studentAnalysis[i]["testInfo"]["test"]["questionPaperId"]]]["questions"], "Application", "revised_blooms_taxonomy"),
				"totalMarksObtained(Knowledge)" : totalMarksObtainedGrouped(studentAnalysis[i], questionsArray[questionPaperIndex[studentAnalysis[i]["testInfo"]["test"]["questionPaperId"]]]["questions"], "Knowledge", "revised_blooms_taxonomy"),
				"totalMarksObtained(Inference)" : totalMarksObtainedGrouped(studentAnalysis[i], questionsArray[questionPaperIndex[studentAnalysis[i]["testInfo"]["test"]["questionPaperId"]]]["questions"], "Inference", "revised_blooms_taxonomy"),
				"textbook": studentAnalysis[i]["testInfo"]["mapping"]["textbook"]["name"]
			}
			dumpingArray.push(analysisObject)
    }
    return dumpingArray;
  }catch(err){
    console.log(err)
    throw err;
  }
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
	let difficulty = {"easy": {"C":0,"W":0,"U":0} ,"medium":{"C":0,"W":0,"U":0}, "hard" : {"C":0,"W":0,"U":0}, "difficult":{"C":0,"W":0,"U":0},"Correct": 0, "Wrong": 0, "Unattempted": 0}
	for ( let key in data["responseData"]["questionResponse"]){
		if([ "Easy", "Medium", "Hard", "Difficult", "EASY", "MEDIUM", "HARD" ].includes(data["responseData"]["questionResponse"][key]["difficulty"])){
			if(data["responseData"]["questionResponse"][key].hasOwnProperty("C")){
				difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["C"] = difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["C"] + 1;
				difficulty["Correct"] = difficulty["Correct"] + 1;
			}
			if(data["responseData"]["questionResponse"][key].hasOwnProperty("W")){
				difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["W"] = difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["W"] + 1
				difficulty["Wrong"] = difficulty["Wrong"] + 1;
			}
			if(data["responseData"]["questionResponse"][key].hasOwnProperty("U")){
				difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["U"] = difficulty[data["responseData"]["questionResponse"][key]["difficulty"].toLowerCase()]["U"] + 1
				difficulty["unattempted"] = difficulty["unattempted"] + 1;
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