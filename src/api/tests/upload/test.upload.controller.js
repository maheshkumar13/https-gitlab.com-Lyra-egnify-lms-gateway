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
import {
  getModel as MasterResult
} from '../masterResults/test.masterResults.model';
import { getStudentDetailsById } from '../../settings/student/student.controller';
import { getModel as TestSnapshot } from './testsnapshot.model';

const couchdb = require("../../../utils/couch");

const encrypt = require('../../../utils/encrypt');
const request = require("request");
const config = require('../../../config/environment')["config"];
const fileUpload = require('../../../utils/fileUpload');
const uuidv1 = require('uuid/v1');

function queryForListTest(args) {
  let query = {
    find: {
      active: true
    },
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

  if (args.branch) {
    query["find"]["branches"] = args.branch;
  }

  if (args.orientation) {
    query["find"]["orientations"] = args.orientation;
  }

  if (args.searchQuery) {
    query["search"]["value"] = args.searchQuery;
    query["search"]["fields"] = ["mapping.subject.name", "test.name", "mapping.textbook.name", "mapping.class.name"]
  }

  if(args.gaStatus){
    query["find"]["gaStatus"] = args.gaStatus;
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
    let limit = args.limit ? args.limit : 0;
    let skip = args.pageNumber ? args.pageNumber - 1 : 0;
    let data = await TestSchema.dataTables({
      limit: limit,
      skip: skip * limit,
      find: queries.find,
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
    const orientationsAndBranches = await getOrientationAndBranches(args.textbookCode, req.user_cxt);
    if (orientationsAndBranches) {
      throw "Invalid textbook"
    } else {
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

export async function updateTest(args, ctx) {
  try {
    validateTestInfo(args);
    const orientationsAndBranches = await getOrientationAndBranches(args.textbookCode, req.user_cxt);
    if (orientationsAndBranches) {
      throw "Invalid textbook"
    } else {
      args["orientations"] = orientationsAndBranches["orientations"];
      args["branches"] = orientationsAndBranches["branches"];
    }
    await updateTestInfo(args, ctx);
    return {
      message: "Test updated successfully."
    }
  } catch (err) {
    throw err;
  }
}

async function updateTestInfo(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    const updatedTest = await TestSchema.findOneAndUpdate({
      _id: args.id
    }, {
      $set: createUpdateObject(args)
    }, {
      new: true
    });
    if (updatedTest) {
      return updatedTest
    } else {
      throw "No such test available";
    }
  } catch (err) {
    throw err;
  }
}

function createUpdateObject(args) {
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

//This function takes in any number of date object as parameter and return whether they are equal in terms of year, month and date.
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

async function getOrientationAndBranches(textbookCode, ctx) {
  try {
    const TextBookSchema = await TextBook(ctx);
    return await TextBookSchema.findOne({
      code: textbookCode
    }).select({
      orientations: 1,
      branches: 1,
      _id: 0
    }).lean();
  } catch (err) {
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
      paper_id: args.paper_id
    },
    markingScheme: args.markingScheme,
    fileKey: args.fileKey,
    active: false,
    branches: args.branches,
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

export async function convertOldTestToNewFormat(req, res) {
  try {
    const OldTestSchema = await OldTest(req.user_cxt);
    let ExistingTestsInOldFormat = await OldTestSchema.aggregate([{
        $match: {
          "content.category": "Tests",
          active: true
        }
      },
      {
        $lookup: {
          from: "textbooks",
          localField: "refs.textbook.code",
          foreignField: "code",
          as: "mapping"
        }
      },
      {
        $unwind: "$mapping"
      },
      {
        $project: {
          "_id": 0,
          "active": 1,
          "mapping.class.code": "$mapping.refs.class.code",
          "mapping.class.name": "$mapping.refs.class.name",
          "mapping.subject.code": "$mapping.refs.subject.code",
          "mapping.subject.name": "$mapping.refs.subject.name",
          "mapping.textbook.code": "$mapping.code",
          "mapping.textbook.name": "$mapping.name",
          "test.name": "$content.name",
          "test.questionPaperId": "$resource.key",
          "branches": "$mapping.branches",
          "orientations": "$mapping.orientations"
        }
      }
    ]);
    const TestSchema = await Tests(req.user_cxt);
    console.log(ExistingTestsInOldFormat.length);
    await TestSchema.create(ExistingTestsInOldFormat);
    return res.status(200).send("Converted old format to new one");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
}

export async function listTextBooksWithTestSubectWise(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    const list = await TestSchema.aggregate([{
      $match: {
        "mapping.subject.code": args.subjectCode,
        "active": true,
        "branches" : args.branchOfStudent,
        "orientations" : args.orientationOfStudent,
        "mapping.class.code" : args.classOfStudent
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

export async function listUpcomingTestTextBookWise(args, ctx) {
  try {
    let promises = await Promise.all([Tests(ctx),await MasterResult(ctx)])
    const TestSchema = promises[0];
    const TestList = await TestSchema.aggregate([{
      "$match": {
        "test.endTime": {
          $gte: new Date()
        },
        active: true,
        "mapping.textbook.code": args.textbookCode
      }
    },{
      $sort : {"test.endTime":1}
    },{
      $lookup: {
        from: "markingschemes",
        localField: "markingScheme",
        foreignField: "_id",
        as: "markingAnalysis"
      }
    }, {
      $unwind: "$markingAnalysis"
    }, {
      $project: {
        _id: 0,
        "totalMarks": "$markingAnalysis.totalMarks",
        "totalQuestions": "$markingAnalysis.totalQuestions",
        "test": 1
      }
    }]);
    const questionPaperIds = TestList.map((obj) => obj["test"]["questionPaperId"]);
    const MasterResultSchema = promises[1];
    const testAlreadySubmittedByStudent = (await MasterResultSchema.find({
      questionPaperId: {
        $in: questionPaperIds
      },
      studentId: ctx.studentId,
      status : { $ne : "SUBMITTED" }
    }).select({
      _id: 0,
      questionPaperId: 1
    })).map((obj) => obj.questionPaperId);
    return appendIsTestActive(TestList, testAlreadySubmittedByStudent);
  } catch (err) {
    throw err;
  }
}

export async function listOfCompletedTestTextBookWise(args , ctx){
  try{
    let promises = await Promise.all([Tests(ctx),MasterResult(ctx)]);
    const TestSchema = promises[0];
    const MasterResultSchema = promises[1];
    const TestList = await TestSchema.find({
      "mapping.textbook.code":args.textbookCode,
      "test.startTime":{ "$lte" : new Date()}
    }).select({_id : 0,test:1});
    const questionPaperIds = TestList.map((obj)=> obj.test.questionPaperId);
    const markingAnalysis = await MasterResultSchema.find({ studentId : ctx.studentId,questionPaperId:{$in:questionPaperIds},status : "SUBMITTED"}).select({_id:0}).lean();
    return appendMarkingAnalysis(TestList,markingAnalysis);
  }catch(err){
    throw err
  }
}

function appendIsTestActive(testArr, testAlreadySubmittedByStudent) {
  let finalUpcomingTest = [];
  for (let i = 0; i < testArr.length; i++) {
    if (testAlreadySubmittedByStudent.indexOf(testArr[i]["test"]["questionPaperId"]) > -1) {
      continue;
    }
    testArr[i]["activeNow"] = new Date(testArr[i]["test"]["startTime"]).getTime() > new Date().getTime() ? false : true;
    finalUpcomingTest.push(testArr[i]);
  }
  return finalUpcomingTest;
}

function appendMarkingAnalysis(possibleListOfCompletedTests,completedTests){
  let finalCompletedTest = [];
  for(let i=0; i < possibleListOfCompletedTests.length; i++){
    let qPid = possibleListOfCompletedTests[i]["test"]["questionPaperId"];
    let indexOfCompletedTest = completedTests.findIndex((obj)=>{
      return qPid === obj["questionPaperId"]
    });
    if(indexOfCompletedTest > -1){
      let obj = JSON.parse(JSON.stringify(possibleListOfCompletedTests[i]));
      obj["markingAnalysis"] = completedTests[indexOfCompletedTest];
      finalCompletedTest.push(obj);
    }else if( indexOfCompletedTest === -1 &&   (new Date(possibleListOfCompletedTests[i]["test"]["endTime"]).getTime() < new Date().getTime())){
      let obj = JSON.parse(JSON.stringify(possibleListOfCompletedTests[i]));
      obj["markingAnalysis"] = null;
      finalCompletedTest.push(obj);
    }
  }
  return finalCompletedTest
}

export async function fetchEncryptedQuestions( req, res){
  try{
    if(!req.params.testId){
      return res.status(400).send("test id is required.")
    }
    let testId = req.params.testId;
    let findQuery = {questionPaperId : testId};
    if(req.query.questionNo){
      findQuery["qno"] = req.query.questionNo;
    }    
    const QuestionModel = await Questions(req.user_cxt);
    let questions = await QuestionModel.find(findQuery).select({_id : 0 ,question:1,qno:1, subject : 1,q_type :1,q_category:1,options : 1,questionPaperId : 1}).lean();
    if(questions.length){
      return res.status(200).send(encrypt.encriptObject(questions));
    }else{
      return res.status(204).send("No Content");
    }
  }catch(err){
    console.error(err);
    return res.status(500).send("Internal server error");
  }
}

export async function fetchDecryptionKey(req , res ){
  return res.status(200).send(config.encript.key);
}

export async function startTest(args , ctx){
  try{
    let promises = await Promise.all([Tests(ctx), MasterResult(ctx)])
    const TestSchema = promises[0] ;
    const MasterResultSchema  = promises[1];
    const isTestAlreadyTakenOrStarted = await MasterResultSchema.findOne({ studentId : ctx.studentId,questionPaperId:args.questionPaperId});
    if(isTestAlreadyTakenOrStarted && isTestAlreadyTakenOrStarted.status === "SUBMITTED"){
      throw "Test already submitted";
    }else{
      let test = await TestSchema.aggregate([{
        $match: {
            "test.questionPaperId": args.questionPaperId,
            "orientations": args.orientationOfStudent,
            "branches": args.branchOfStudent,
            "mapping.class.code": args.classOfStudent,
            "test.startTime": {
                $lte: new Date()
              },
            "test.endTime": {
                $gte: new Date()
              },
              active : true
            }
          },
          {
            $project:{
              _id : 0,
              test : 1,
              questions : 1,
              mapping : 1
            }
          }
        ]
      )
      if(!test.length){
        throw "Invalid test or test not started yet";
      }
      let duration = test.test.duration; //In minutes

      if(isTestAlreadyTakenOrStarted && isTestAlreadyTakenOrStarted.status === "STARTED"){
        let timeLeft = (new Date().getTime() -  new Date(isTestAlreadyTakenOrStarted.startedAt).getTime()) / 1000*60;
        if(timeLeft >= duration){
          throw "Test duration is already completed."
        }else{
          return {
            status: 'success',
            syncDbUrl: isTestAlreadyTakenOrStarted.syncDbUrl,
            shouldSync: isTestAlreadyTakenOrStarted.status === "STARTED" ? true : false, // eslint-disable-line
            testKey : config.encript.key,
            timeLeft,
            duration
          };
        }
      }
      // const timeString = new Date();
      const randValue = Math.floor(Math.random() * (999 - 100 + 1) + 100); // eslint-disable-line
      const dbName = `${ctx.instituteId}_${args.questionPaperId}_${ctx.studentId}_${randValue.toString()}`.toLowerCase();
      const syncDbUrl = `${config.COUCH_DB_URL}/${dbName}`;
      const masterResultMapping = {
        questionPaperId: args.questionPaperId,
        studentId: ctx.studentId,
        status: "STARTED",
        startedAt: new Date(),
        classCode: args.classOfStudent,
        textbookCode: test[0].mapping.textbook.code,
        subjectCode: test[0].mapping.subject.code,
        branch: args.branchOfStudent,
        orientation: args.orientationOfStudent,
        instructionAccepted : args.instructionAccepted ? args.instructionAccepted : false,
        syncDbUrl : syncDbUrl
      }
      await MasterResultSchema.create(masterResultMapping);
      // test[0]["serverStartTime"] = args.startTime
      // delete test[0]["mapping"]
      return {
        status: 'success',
        syncDbUrl:  syncDbUrl,
        shouldSync: false, // eslint-disable-line,
        testKey : config.encript.key,
        duration,
        timeLeft : duration
      };
    }
  }catch(err){
    throw err;
  }
}

export async function headerCount(args , ctx){
  try{
    let matchPipeline = { active : true , type : "textbookbasedtest"};
    if( args.classCode ){
      matchPipeline["mapping.class.code"] = args.classCode
    }
  
    if(args.orientation){
      matchPipeline["orientations"] = args.orientation
    }
  
    if(args.branch){
      matchPipeline["branches"] = args.branch
    }
  
    if(args.subjectCode){
      matchPipeline["mapping.subject.code"] = args.subjectCode
    }
  
    if(args.textbookCode){
      matchPipeline["mapping.textbook.code"] = args.textbookCode
    }
  
    let groupPipeline = {
      "_id" : `$mapping.${args.header}.code`,
      count : {$sum:1}
    }

    const TestSchema = await Tests(ctx);
    const result = await TestSchema.aggregate([
      {
        $match : matchPipeline
      },
      {
        $group : groupPipeline
      }
    ]);
    let outputResult = {};
    result.forEach(function(obj){
      outputResult[obj._id] = obj["count"];
    })
    return outputResult;
  }catch(err){
    throw err;
  }
}

export async function fetchInstructions(args , ctx ){
  try{
    const TestSchema = await Tests(ctx);
    let currTime = new Date();
    const instructions = await TestSchema.aggregate([
      {
        $match : {
          "test.questionPaperId" : args.testId,
          active : true,
          "test.startTime" : { $lte : new Date(currTime)},
          "test.endTime" : { $gte : new Date(currTime)}
        }
      },{
        $lookup : {
          from : "markingschemes",
          localField : "markingScheme",
          foreignField : "_id",
          as : "markingScheme"
        }
      },
      {
        $unwind : "$markingScheme"  
      },
      {
        $project : {
          markingScheme : 1,
          "startTime" : "$test.startTime",
          "endTime" : "$test.endTime",
          "duration" : "$test.duration",
          "_id" : 0
        }
      }
    ]);
    return instructions;
  }catch(err){
    throw err;
  }
}

// {
//   "testId":"*******",
//   "rawResponse":{
//     "1" : ["a","b"], //more than one option correct
//     "2" : ["c"], // single answer correct
//     "3" : ["d"],
//     "4" : [] // unattempted or nothing,
//     ...
//   }
// }
// @params submisssionTime NOT REQUIRED client time cannot be trusted.
// triggered when submit test is done or autotriggered when the duration of test is completed.
// 
export async function completeTest ( args , ctx ){
  //Trigger an api to GA server with CWU ANALYSIS , RAW RESPONSE and BEHAVIOUR DATA 
  //should be asynchronusly triggered with retries upto 3 times if failed keep in db so that can be synchronised later
  //Need cron job to sync couchdb to lms mongo if the request is not made due to internet connectivity.
  //once request is received validate the time at which test was submitted, if valid calculate CWU and total marks obtained with percentage.
  try{
    const promisesA = await Promise.all([MasterResult(ctx),Tests(ctx),Questions(ctx),TestSnapshot(ctx)]);
    const MasterSchema = promisesA[0];
    const TestSchema = promisesA[1];
    const QuestionsSchema = promisesA[2];
    const TestSnapshotSchema =  promisesA[3];
    const test = TestSchema.aggregate([
      {$match: {"test.questionPaperId": args.testId}},
      {$lookup:{
          from : "markingschemes",
          localField : "markingScheme",
          foreignField : "_id",
          as : "markingScheme"   
      }},{$unwind : "$markingScheme"},{
        $project : {
          _id : 0,
          test : 1,
          markingScheme : 1
        }
      }
    ]);
    const master = MasterSchema.findOne({ studentId : ctx.studentId,questionPaperId : args.testId,status : "STARTED"}).lean();
    const questions = QuestionsSchema.find({questionPaperId : args.testId}).select({_id : 0,key : 1,qno : 1}).lean();
    const promisesB = await Promise.all([test,master,questions]);
    const testDetails = promisesB[0];
    const correctOptions = promisesB[2];
    const studentTestDetails = promisesB[1];
    if(!testDetails || !correctOptions || !studentTestDetails){
      throw "Invalid test or student or student has not started test yet."
    }
    const submisssionTime = new Date();
    let timeDiff = (new Date(submisssionTime).getTime()- new Date(studentTestDetails.startedAt).getTime())/60000;
    if( testDetails.test.duration < timeDiff ){
      //Get behaviour data from couchDB and generate everything other than rank analysis
      if(studentTestDetails.totalMarks){
        throw "Test is over, please wait for your result"; 
      }
    }
    let correctAnswerMapping = {};
    correctOptions.forEach(function(objt){
      correctAnswerMapping[objt["qno"]] = objt["key"];
    });
    const behaviourData = await fetchBehaviourDataFromCouchDb(studentTestDetails.syncDbUrl);
    args.behaviourData = behaviourData;
    if(!studentTestDetails.totalMarks){
      const rawResponseFromBehaviourData = getRawResponseFromBehaviourData(behaviourData);
      args.rawResponse = rawResponseFromBehaviourData;
    }
    args.testName = test.test.name;
    let analysisOfTest = calculateMarks(args.rawResponse,testDetails.markingScheme,correctAnswerMapping);
    analysisOfTest["timeTaken"] = timeDiff;
    analysisOfTest["completedAt"] = new Date(submisssionTime);
    updateMasterResult(MasterSchema,analysisOfTest,ctx);
    createTestSnapshotData(TestSnapshotSchema , args,analysisOfTest,ctx );
    return analysisOfTest;
  }catch(err){
    throw err;
  }
}

function calculateMarks(rawResponse , markingScheme , correctOptions){
  let marksObtained = 0 , percentageObtained;
  let cwuAnalysis = {C : 0,W : 0, R : 0};
  let responseData = {
    evaluation: {},
    score : { },
    response : rawResponse
  };
  for(let key in correctOptions){
    if(rawResponse.hasOwnProperty(key)){
      if(isEqual(rawResponse[key],correctOptions[key])){
        responseData.evaluation[key] = "C";
        cwuAnalysis["C"] = cwuAnalysis["C"] + 1;
        responseData.score[key] = markingScheme.eval.rightAnswer;
        marksObtained = marksObtained + markingScheme.eval.rightAnswer;
      }else{
        responseData.evaluation[key] = "W";
        cwuAnalysis["W"] = cwuAnalysis["W"] + 1;
        responseData.score[key] = markingScheme.eval.wrongAnswer;
        marksObtained = marksObtained + markingScheme.eval.wrongAnswer;
      }
    }else{
      responseData.evaluation[key] = "U";
      cwuAnalysis["U"] = cwuAnalysis["U"] + 1;
      responseData.score[key] = markingScheme.eval.wrongAnswer;
      marksObtained = marksObtained + markingScheme.eval.wrongAnswer;

    }
  }
  percentageObtained = (marksObtained * 100)/markingScheme.totalMarks;
  return {marksObtained,cwuAnalysis,percentageObtained,cwuAnalysis,responseData};
}
function isEqual(a , b) {
  if (a.length != b.length)
      return false;
  else {
      for (var i = 0; i < a.length; i++){
        if (a[i] != b[i]){
            return false;
        }
      }
      return true;
  }
}

async function fetchBehaviourDataFromCouchDb(dbName){
  try{
    const couchSyncDb = await couchdb.use(dbName);
    const data = await couchSyncDb.list({ include_docs: true });
    const { rows } = data;
    const behaviourData = [];
    for (let l = 0; l < rows.length; l += 1) {
      behaviourData.push(rows[l].doc);
    }
    couchSyncDB.destroy(dbName,function(err,deleted){
      console.log(err);
    });
    return behaviourData;
  }catch(err){
    throw err;
  }
}

function getRawResponseFromBehaviourData(behaviourData){
  let rawResponse = {};
  behaviourData.forEach(function(resp){
    rawResponse[resp.questionNumber] = resp["latestResponse"].pop()
  });
  return rawResponse;
}

function updateMasterResult(MasterSchema , args,ctx){
  MasterSchema.update({questionPaperId : args.testId,studentId : ctx.studentId},{
    $set : {
      status :  "SUBMITTED",
      timeTaken : args.timeTaken,
      completedAt : args.completedAt,
      percentage : args.percentageObtained,
      obtainedMarks : args.marksObtained,
      cwuAnalysis: args.cwuAnalysis,
      responseData : args.responseData
    }
  });
}

async function createTestSnapshotData(TestSnapshotSchema , args , analysisOfTest , ctx){
  try{
    const studentDetails = await getStudentDetailsById(ctx.studentId , ctx);
    TestSnapshotSchema.create({
      studentId :   ctx.studentId,
      testId : args.testId,
      studentName : studentDetails.studentName || null,
      fatherName : studentDetails.fatherName || null,
      phone : null,
      email : null,
      dob : studentDetails.dob || null,
      gender : studentDetails.gender || null,
      category : studentDetails.category || null,
      hierarchy : studentDetails.hierarchy || [],
      egnifyId : studentDetails.egnifyId || null,
      accessTag : {hierarchy : studentDetails.hierarchy.pop()["childCode"]},
      testName : args.testName,
      hierarchyTag : null,
      behaviourData : args.behaviourData,
      hierarchyLevels : studentDetails.hierarchyLevels,
      responseData : {
        questionResponse : analysisOfTest.responseData.evaluation,
        questionsMarks :  analysisOfTest.responseData.score,
        rawResponse : args.rawResponse
      }
    },function (err , testSnapshot){
      if(err){
        console.log(err);
      }
    })
  }catch(err){
    console.log(err);
  }
}