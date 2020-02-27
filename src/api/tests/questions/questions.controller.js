import { getModel as QuestionModel } from './questions.model';
import { getModel as MasterResultModel } from '../masterResults/masterResults.model';
import { getModel as ContentMappingModel } from '../../settings/contentMapping/contentMapping.model';
import { getModel  as TextBook } from '.././../settings/textbook/textbook.model';
import { config } from '../../../config/environment';
import request from 'request';
const md5 = require('md5');
var client = require('../../../redis');
const uuidv1 = require('uuid/v1');
const fileUpload = require('../../../utils/fileUpload')
const SUPPORTED_QUESTION_PAPER_MEDIA_TYPES = ["docx","doc","xlsx","zip"]
const fs = require("fs");
const MIME_TYPE = {
  "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xml":  "application/zip", //the mimetype is of zip because we are taking zip file in place of xml
  "doc":  "application/msword"
}

function getQuery(args) {
  const query = {};
  if (args.questionPaperId) query.questionPaperId = args.questionPaperId;
  return query;
}

export async function getQuestions(args, context) {
  if (!args.questionPaperId) throw new Error('questionPaperId required');
  const query = getQuery(args);
  return QuestionModel(context).then(Question => Question.find(query));
}

async function prepareDataForMasterResults(args, resultStats, evaluation, context) {
  const {
    studentId, questionPaperId, responses,
  } = args;
  const whereObj = { studentId, questionPaperId };
  const responseData = {
    evaluation: evaluation.evaluatedResponse,
    score: evaluation.evaluatedScore,
    response: responses,
  };
  const cwuAnalysis = {
    C: resultStats.countOfC,
    W: resultStats.countOfW,
    U: resultStats.countOfU,
  };
  const refs = {
    questionPaperId,
  };
  const setObj = {
    studentId,
    responseData,
    cwuAnalysis,
    refs,
    obtainedMarks: resultStats.obtainedMarks,
  };
  await MasterResultModel(context).then(masterResults =>
    masterResults.updateOne(whereObj, { $set: setObj }, { upsert: true }, (err) => {
      if (err) {
        return err;
      }
      return 'Inserted Successfully';
    }));
}

export async function getAndSaveResults(args, context) {
  args = args.input; //eslint-disable-line
  if (!args.questionPaperId) throw new Error('questionPaperId is required');
  if (!args.responses) throw new Error('responses array is required');
  const responses = args.responses ? args.responses : {};
  const query = getQuery(args);
  return QuestionModel(context).then(Questions => Questions.find(query, {
    key: 1, qno: 1, questionPaperId: 1, C: 1, W: 1, U: 1,
  }).then((questionsObj) => {
    const resultStats = {
      countOfC: 0,
      countOfU: 0,
      countOfW: 0,
      obtainedMarks: 0,
    };
    const evaluation = { evaluatedResponse: {}, evaluatedScore: {} };
    const quesKeyObject = {};
    questionsObj.forEach((qObj) => {
      const keyArray = [];
      qObj.key.forEach((keyValue) => {
        keyArray.push(keyValue.toLowerCase());
      });
      quesKeyObject[qObj.qno] = {
        key: keyArray,
        C: qObj.C,
        W: qObj.W,
        U: qObj.U,
      };
    });
    if (responses) {
      Object.keys(responses).forEach((qno) => {
        // console.log('quesKeyObject[qno]', quesKeyObject[qno]);
        if (responses[qno].length === 0) {
          evaluation.evaluatedResponse[qno] = 'U';
          evaluation.evaluatedScore[qno] = quesKeyObject[qno].U;
          resultStats.countOfU += 1;
        } else if (responses[qno].length === quesKeyObject[qno].key.length) {
          let tempCount = 0;
          responses[qno].forEach((option) => {
            if (quesKeyObject[qno].key.includes(option.toLowerCase())) {
              console.info(quesKeyObject[qno].key);
              console.info(option.toLowerCase());
              tempCount += 1;
            }
          });
          if (tempCount === quesKeyObject[qno].key.length) {
            resultStats.countOfC += 1;
            evaluation.evaluatedResponse[qno] = 'C';
            evaluation.evaluatedScore[qno] = quesKeyObject[qno].C;
            resultStats.obtainedMarks += quesKeyObject[qno].C;
          } else {
            evaluation.evaluatedResponse[qno] = 'W';
            evaluation.evaluatedScore[qno] = quesKeyObject[qno].W;
            resultStats.countOfW += 1;
          }
        } else {
          evaluation.evaluatedResponse[qno] = 'W';
          evaluation.evaluatedScore[qno] = quesKeyObject[qno].W;
          resultStats.countOfW += 1;
        }
      });
    }
    prepareDataForMasterResults(args, resultStats, evaluation, context);
    return resultStats;
  }));
}

export async function getQuestionLevelEvaluatedData(args, context) {
  console.info('args', args);
  console.info('context', context);
  const query = {};
  if (!args.input.questionPaperId) {
    throw new Error('questionPaperId is required');
  } else {
    query.questionPaperId = args.input.questionPaperId;
  }
  if (args.input.questionNos) {
    query.qno = {
      $in: args.input.questionNos,
    };
  }
  return QuestionModel(context).then(Question => Question.find(query, {
    key: 1, qno: 1, questionPaperId: 1, solution: 1, hint: 1, _id: 0,
  }).then((res) => {
    // console.info('res', res);
    const finalObj = { questionPaperId: res[0].questionPaperId };
    const tempArray = [];
    res.forEach((quesObj) => {
      tempArray.push({
        questionNo: quesObj.qno,
        key: quesObj.key,
        hint: quesObj.hint,
        solution: quesObj.solution,
      });
    });
    finalObj.evaluatedData = tempArray;
    return finalObj;
  }));
}

export async function practiceParseAndValidate(req, res) {
  const { className, subject, textbookCode, chapterCode, fileName, qNo, fileKey } = req.body;
  if (!className) {
    return res.status(400).send("Class fileName is required to upload a Practice.")
  }

  if (!fileKey) {
    return res.status(400).send("File key is required to upload a Practice.")
  }

  if (!qNo) {
    return res.status(400).send("Q no. is required to upload a Practice");
  }

  if (!fileName) {
    return res.status(400).send("File fileName is required to upload a Practice.")
  }

  if (!subject) {
    return res.status(400).send("Subject is required to upload a Practice.")
  }

  if (!textbookCode) {
    return res.status(400).send("Textbook is required to upload a Practice.");
  }

  if (!chapterCode) {
    return res.status(400).send("Chapter is required to upload a Practice.");
  }
  let lang = "english";
  //'hindi','telugu','tamil','kannada','sanskrit'
  if (subject.toLowerCase() === "telugu" ||
    subject.toLowerCase() === "hindi" ||
    subject.toLowerCase() === "tamil" ||
    subject.toLowerCase() === "kannada" ||
    subject.toLowerCase() === "sanskrit") {
    lang = subject.toLowerCase();
  }

  fileUpload.s3GetFileData(fileKey, async function (err, data) {
    try {
      if (err) {
        return res.status(500).send("Internal server error.");
      } else {
        const mimeType = {
          "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "xml": "text/xml"
        }
        const file_id = fileKey;
        const url = config.parser.uri+"?subject=" + lang + "&file_id=" + file_id;
        const file_data = data.data;
        const option = {
          method: "POST",
          url: url
        }
        const name = fileKey.split("/")[1];
        const contetType = mimeType[name.split(".").pop()];
        const parsedData = await parseFile(option, name, contetType, file_data);
        const jsonifiedData = JSON.parse(parsedData);
        let errorQuestions = jsonifiedData.filter((question) => {
          return question.errors.length > 0;
        });
        let errorQuestionNumbers = errorQuestions.map((question) => {
          return question.qno;
        });
        let percentageError = (errorQuestions.length / jsonifiedData.length) * 100;
        const qPid = uuidv1();
        const branchAndOrientation  =  await getOrientationAndBranches(textbookCode , req.user_cxt)
        if(!branchAndOrientation){
          return res.status(400).send("Invalid textbook");
        }
        let obj = {
          "content": {
            "name": fileName,
            "category": "Practice",
            "type": "Objective Questions"
          },
          "resource": {
            "key": qPid,
            "size": data.size / 1024^2,
            "type": name.split(".").pop()
          },
          "publication": null,
          "coins": "0",
          "orientation": null,
          "refs": {
            "topic": {
              "code": chapterCode
            },
            "textbook": {
              "code": textbookCode
            }
          },
          "branches": branchAndOrientation["branches"],
          "category": branchAndOrientation["orientations"],
          "active": false,
          "category" : ''
        }
        // console.log(setContentMappingForPractice(obj, req.user_cxt));
        const mapping = await setContentMappingForPractice(obj, req.user_cxt);
        // console.log(mapping);
        await setQuestionInDb(jsonifiedData, req.user_cxt ,  qPid , fileKey);
        return res.status(200).send({ jsonifiedData, percentageError, errorQuestionNumbers , paper_id : mapping["_id"]});
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }
  });
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

export async function publishPractice (req , res ){
  try{
    let { paper_id } = req.body;
    const _id = paper_id;
    const ContentMapping = await ContentMappingModel(req.user_cxt);
    await ContentMapping.findOneAndUpdate({ _id },{$set: {active :true}},{multi : false , new : true }).lean()
    return res.status(200).send({message : "Practice published successfully."})
  }catch(err){
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
}
async function setContentMappingForPractice(obj, ctx) {
  try{
    const contentMapping = await ContentMappingModel(ctx);
    const mappings = await contentMapping.create(obj);
    return mappings;
  }catch(err){
    console.log(err);
    throw new Error(err);
  }
}

async function setQuestionInDb(questions , ctx , qpid , filePath){
    try{
      for(let i = 0 ; i < questions.length ; i ++){
        questions[i]["questionPaperId"] = qpid;
      }
      const Questions = await QuestionModel(ctx);
      await Questions.create(questions);
      return true;
    }catch(err){
      throw new Error(err);
    }
}

async function parseFile(option, filename, contentType, data) {
  return new Promise(function (resolve, reject) {
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

export async function parserStatus(req, res) {
  try {
    if (!req.body.file_id) {
      return res.status(400).send("File id is requried.");
    }

    const file_id = req.body.file_id;
    client.get(file_id, function (err, reply) {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal server error.")
      } else {
        console.log(reply);
        return res.status(200).send(JSON.parse(JSON.parse(reply)));
      }
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send('Internal server error.');
  }
}

export async function parseQuestionPaper(req,res){
  try{
    const Questions = await QuestionModel(req.user_cxt);
    const {content_name,subject, asset_id} = req.body;
    if(!content_name || !subject || !asset_id){
      return res.status(400).send("BAD_ARGS");
    }
    if (!req.file) {
      return res.status(400).send({message: 'File required', error: true});
    }

    let extname = (req.file.originalname.split('.').pop()).toLowerCase();

    if (!SUPPORTED_QUESTION_PAPER_MEDIA_TYPES.includes(extname)) {
      return res.status(400).send({message:`Invalid file extension, supported media types are ${SUPPORTED_QUESTION_PAPER_TYPES}`,error: true});
    }

    if(extname === "zip"){
      extname = "xml"
    }

    const option = {
      url: `${config.parser.uri}?subject=${subject.trim()}&file_name=${content_name.trim()}&file_type=${extname.trim()}`,
      method: "POST"
    }
    let questions = await parseQuestion(option, content_name, MIME_TYPE[extname], req.file.buffer);
    const questionPaperId = uuidv1();
    
    if(!questions){
      return res.status(400).send(questions || "Invalid File.")
    }
    
    questions = JSON.parse(questions);
    if(!questions.length){
      return res.status(400).send(questions ? questions.status : "Invalid File.")
    }
    for(let j = 0 ; j < questions.length; j++){
      questions[j]["questionPaperId"] = questionPaperId,
      questions[j]["optionHash"] = questions[j]["options"] ? md5(JSON.stringify(questions[j]["options"])) : null;
      questions[j]["questionHash"] = questions[j]["question"] ? md5(questions[j]["question"]) : null;
      questions[j]["keyHash"] = questions[j]["key"] ? md5(JSON.stringify(questions[j]["key"])) : null;
      questions[j]["questionNumberId"] = questions[j]["optionHash"] && questions[j]["questionHash"] && questions[j]["keyHash"] ? md5(questions[j]["optionHash"]+questions[j]["questionHash"]+questions[j]["keyHash"]) : null;
      questions[j]["subject"] = subject;
      questions[j]["error"] = questions[j]["errors"] || [];
      delete questions[j]["errors"];
    }
    // await Questions.remove({questionPaperId});
    await Questions.create(questions);
    
    return res.status(200).send({questionPaperId});
  }catch(err){
    console.log(err);
    return res.status(500).send(err);
  }
}

function parseQuestion(option, filename, contentType, data) {
  return new Promise(function (resolve, reject) {
    var req = request(option, function (err, resp, body) {
      if (err) {
        reject(err);
      } else {
        if (resp.statusCode === 200) {
          resolve(body);
        }
        reject(err || resp || body);
      }
    });
    var form = req.form();
    form.append('file', data, {
      filename: filename,
      contentType: contentType
    });
  });
}

export default { getQuestions, getAndSaveResults, getQuestionLevelEvaluatedData, practiceParseAndValidate, parserStatus ,publishPractice };