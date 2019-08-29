import {
  getModel as Tests
} from './test.upload.model';
import {
  getModel as Questions
} from '../questions/questions.model';
import {
  getModel as OldTest
} from '../../settings/contentMapping/contentMapping.model';

import {
  getModel as TextBook
} from '../../settings/textbook/textbook.model';

const request = require("request");
const config = require('../../../config/environment')["config"];
const fileUpload = require('../../../utils/fileUpload');
const uuidv1 = require('uuid/v1');
 
function queryForListTest(args) {
  let query = {
    find: {active : true},
    search: {},
    sort: {
      "test.date": -1
    }
  }
  if (args.classCode) {
    query["find"]["mapping.class.code"] = args.classCode;
  }
  if (args.textbookCode) {
    query["find"]["mapping.textbook.code"] = args.textbookCode;
  }
  if (args.subjectCode) {
    query["find"]["mapping.subject.code"] = args.subjectCode;
  }

  if(args.branch){
    query["find"]["branches"] = args.branch;
  }

  if(args.orientation){
    query["find"]["orientations"] = args.orientation;
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

export async function listTest(args, ctx) {
  try {
    const queries = queryForListTest(args);
    const TestSchema = await Tests(ctx);
    let limit = args.limit ? args.limit : 40 ;
    let skip = args.pageNumber ? args.pageNumber-1 : 0; 
    let data = await TestSchema.dataTables({
      limit: limit,
      skip: skip*limit,
      find: queries.find,
      search: queries.search,
      sort: queries.sort,
    });

    data["pageInfo"] = {
      pageNumber : args.pageNumber,
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


function validateTestInfo(args) {
  if (new Date(args.startTime) == "Invalid Date") {
    throw "Invalid start time.";
  } else if (new Date(args.startTime).getTime() <= new Date().getTime()) {
    console.log(new Date(args.startTime).getTime(), new Date().getTime());
    throw "Invalid start time.";
  }
  if (new Date(args.endTime) == "Invalid Date") {
    throw "Invalid end time.";
  } else if (new Date(args.endTime).getTime() <= new Date().getTime()) {
    throw "Invalid end time.";
  }
  if (new Date(args.testDate) == "Invalid Date") {
    throw "Invalid test date.";
  } else if (new Date(args.testDate).getTime() <= new Date().getTime()) {
    throw "Invalid test date.";
  }
  if (!compareDays(args.startTime, args.testDate)) {
    throw "Date mismatch.";
  }

  if ((new Date(args.endTime).getTime() - new Date(args.startTime).getTime()) < parseInt(args.testDuration)) {
    throw "End time minus starttime cannot be samller than test duration.";
  }
  return '';
}

export async function parseAndValidateTest(args, ctx) {
  try {
    validateTestInfo(args); //validaion of user inputs
    let lang = "english";
    //'hindi','telugu','tamil','kannada','sanskrit'
    if (args.subjectName.toLowerCase() === "telugu" ||
      args.subjectName.toLowerCase() === "hindi" ||
      args.subjectName.toLowerCase() === "tamil" ||
      args.subjectName.toLowerCase() === "kannada" ||
      args.subjectName.toLowerCase() === "sanskrit") {
      lang = args.subjectName.toLowerCase();
    }
    let data = await fileUpload.s3GetFileData(args.fileKey);
    const mimeType = {
      "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "xml": "text/xml"
    }
    const file_id = args.fileKey;
    const url = config.parser.uri + "?subject=" + lang + "&file_id=" + file_id;
    const file_data = data.data;
    const option = {
      method: "POST",
      url: url
    }
    const name = args.fileKey.split("/")[1];
    const contetType = mimeType[name.split(".").pop()];
    let parsedData = await parseFile(option, name, contetType, file_data);
    const paper_id = uuidv1();
    args["paper_id"] = paper_id;
    const orientationsAndBranches = await getOrientationAndBranches(args.textbookCode,req.user_cxt);
    if(orientationsAndBranches){
      throw "Invalid textbook"
    }else{
      args["orientations"] = orientationsAndBranches["orientations"];
      args["branches"] = orientationsAndBranches["branches"];
    }
    let test = await createTest(args, ctx);
    const jsonifiedData = JSON.parse(parsedData);
    let errorQuestions = jsonifiedData.filter((question) => {
      return question.errors.length > 0;
    });
    let errorQuestionNumbers = errorQuestions.map((question) => {
      return question.qno;
    });
    let percentageError = (errorQuestions.length / jsonifiedData.length) * 100;
    await setQuestionInDb(jsonifiedData, ctx, paper_id, args.fileKey);
    return {
      jsonifiedData,
      percentageError,
      errorQuestionNumbers,
      test_id: test["_id"]
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function updateTest(args, ctx){
  try{
    validateTestInfo(args);
    const orientationsAndBranches = await getOrientationAndBranches(args.textbookCode,req.user_cxt);
    if(orientationsAndBranches){
      throw "Invalid textbook"
    }else{
      args["orientations"] = orientationsAndBranches["orientations"];
      args["branches"] = orientationsAndBranches["branches"];
    }
    await updateTestInfo(args , ctx);
    return { message : "Test updated successfully." }
  }catch(err){
    throw err;
  }
}

async function updateTestInfo( args , ctx){
  try{
    const TestSchema = await Tests(ctx);
    const updatedTest = await TestSchema.findOneAndUpdate({
      _id : args.id
    },{$set:createUpdateObject(args)},{new : true});
    if(updatedTest){
      return updatedTest
    }else{
      throw "No such test available";
    }
  }catch(err){
    throw err;
  }
}

function createUpdateObject(args){
  let updateQuery = {}
  updateQuery["test.startTime"] = args.startTime
  updateQuery["test.endTime"] = args.endTime
  updateQuery["test.date"] = args.testDate
  updateQuery["test.duration"] = args.testDuration
  updateQuery["test.name"] = args.test_name
  updateQuery["mappings.class.code"] = args.classCode
  updateQuery["mappings.class.name"] = args.className
  updateQuery["mappings.subject.code"] = args.subjectCode
  updateQuery["mappings.subject.name"] = args.subjectName
  updateQuery["mappings.textbook.name"] = args.textbooName
  updateQuery["mappings.textbook.code"] = args.textbookCode
  updateQuery["orientations"] = args.orientations
  updateQuery["branches"] = args.branches
  updateQuery["markingScheme"] = args.markingScheme
  return updateQuery;
}

//This function taken in any number of date object as parameter and return whether they are equal in terms of year, month and date.
function compareDays() {
  let compare = true;
  let dateInfo = {
    "year": null,
    "month": null,
    "day": null
  };
  if (arguments.length <= 1) {
    return "Pass atleast two dates to a compare day."
  }
  for (let i = 0; i < arguments.length; i++) {
    if (dateInfo.year && (new Date(arguments[i]).getFullYear() != dateInfo.year)) {
      compare = false;
      break;
    } else {
      dateInfo.year = new Date(arguments[i]).getFullYear();
    }
    if (dateInfo.month && (new Date(arguments[i]).getMonth() != dateInfo.month)) {
      compare = false;
      break;
    } else {
      dateInfo.month = new Date(arguments[i]).getMonth();
    }
    if (dateInfo.day && (new Date(arguments[i]).getDate() != dateInfo.day)) {
      compare = false;
      break;
    } else {
      dateInfo.day = new Date(arguments[i]).getDate();
    }
  }
  return compare;
}

async function getOrientationAndBranches(textbookCode,ctx){
  try{
    const TextBookSchema = await TextBook(ctx);
    return await TextBookSchema.findOne({code : textbookCode}).select({orientations:1,branches:1,_id : 0}).lean();
  }catch(err){
    throw err;
  }
}

async function setQuestionInDb(questions, ctx, qpid, filePath) {
  try {
    for (let i = 0; i < questions.length; i++) {
      questions[i]["questionPaperId"] = qpid;
    }
    const QuestionsSchema = await Questions(ctx);
    await QuestionsSchema.create(questions);
    return true;
  } catch (err) {
    throw new Error(err);
  }
}

async function parseFile(option, filename, contentType, data) {
  return new Promise(function (resolve, reject) {
    console.log(option);
    var req = request(option, function (err, resp, body) {
      if (err) {
        reject(err);
      } else {
        if (resp.statusCode !== 200) {
          reject("Parse Error");
        } else {
          resolve(body);
        }
      }
    });
    var form = req.form();
    form.append('file', data, {
      filename: filename,
      contentType: contentType
    });
  });
}

function createObjectForTestMapping(args) {
  return {
    mapping: {
      class: {
        code: args.classCode,
          name: args.className
      },
      subject: {
        code: args.subjectCode,
        name: args.subjectName
      },
      textbook: {
        code: args.textbookCode,
        name: args.textbooName
      }
    },
    test: {
      name: args.test_name,
      startTime: new Date(args.startTime),
      endTime: new Date(args.endTime),
      date: new Date(args.testDate),
      duration: parseInt(args.testDuration),
      paper_id : args.paper_id
    },
    markingScheme: args.markingScheme,
    fileKey: args.fileKey,
    active: false,
    branches : args.branches,
    orientations: args.orientations
  }
}

async function createTest(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    return await TestSchema.create(createObjectForTestMapping(args));;
  } catch (err) {
    throw err;
  }
}

export async function publishTest(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    let result = await TestSchema.findOneAndUpdate({
      _id: args.id
    }, {
      $set: {
        active: true
      }
    }, {
      new: true
    });
    if (result) {
      return {
        "message": "Test published successfully."
      };
    } else {
      return {
        "message": "No such test availbale."
      };
    }
  } catch (err) {
    throw err;
  }
}

export async function convertOldTestToNewFormat(req, res){
  try{
    const OldTestSchema = await OldTest(req.user_cxt);
    let ExistingTestsInOldFormat   = await OldTestSchema.aggregate([
      {$match:{"content.category":"Tests",active:true}},
      {$lookup:{from:"textbooks",localField:"refs.textbook.code",foreignField:"code",as:"mapping"}},
      {$unwind:"$mapping"},
      {
        $project:{
          "_id" : 0,
          "active" : 1,
          "mapping.class.code":"$mapping.refs.class.code",
          "mapping.class.name" : "$mapping.refs.class.name",
          "mapping.subject.code":"$mapping.refs.subject.code",
          "mapping.subject.name" : "$mapping.refs.subject.name",
          "mapping.textbook.code" : "$mapping.code",
          "mapping.textbook.name":"$mapping.name",
          "test.name":"$content.name",
          "test.paper_id" : "$resource.key",
          "branches":"$mapping.branches",
          "orientations":"$mapping.orientations"
        }
      }
    ]);
    const TestSchema = await Tests(req.user_cxt);
    console.log(ExistingTestsInOldFormat.length);
    await TestSchema.create(ExistingTestsInOldFormat);
    return res.status(200).send("Converted old format to new one");
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal server error");
  }
}
