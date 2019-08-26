import {
  getModel as Tests
} from './test.upload.model';
import {
  getModel as Questions
} from '../questions/questions.model';
const request = require("request");

const config = require('../../../config/environment')["config"];
const fileUpload = require('../../../utils/fileUpload');

function queryForListTest(args) {
  let query = {
    find: {},
    search: {},
    sort: {
      "test.date": -1
    }
  }
  if (args.class_code) {
    query["find"]["mapping.class.code"] = args.class_code;
  }
  if (args.textbook_code) {
    query["find"]["mapping.textbook.code"] = args.textbook_code;
  }
  if (args.subject_code) {
    query["find"]["mapping.subject.code"] = args.subject_code;
  }

  if (args.search_query) {
    query["search"]["value"] = args.search_query;
    query["search"]["fields"] = ["mapping.subject.name", "test.name", "mapping.textbook.name", "mapping.class.name"]
  }

  if (args.sort_order === "asc") {
    query["sort"] = {
      "test.date": 1
    }
  }

  return query;

}

export async function listTest(args, ctx) {
  try {
    console.log(args);
    const queries = queryForListTest(args);
    const TestSchema = await Tests(ctx);
    return await TestSchema.dataTables({
      limit: 0,
      skip: 0,
      find: queries.find,
      search: queries.search,
      sort: queries.sort,
    });
  } catch (err) {
    throw err;
  }
}

function validateTestInfo(args) {
  if (new Date(args.start_time) == "Invalid Date") {
    throw "Invalid start time.";
  } else if (new Date(args.start_time).getTime() <= new Date().getTime()) {
    console.log(new Date(args.start_time).getTime(), new Date().getTime());
    throw "Invalid start time.";
  }
  if (new Date(args.end_time) == "Invalid Date") {
    throw "Invalid end time.";
  } else if (new Date(args.end_time).getTime() <= new Date().getTime()) {
    throw "Invalid end time.";
  }
  if (new Date(args.test_date) == "Invalid Date") {
    throw "Invalid test date.";
  } else if (new Date(args.test_date).getTime() <= new Date().getTime()) {
    throw "Invalid test date.";
  }
  if (!compareDays(args.start_time, args.test_date)) {
    throw "Date mismatch.";
  }

  if ((new Date(args.end_time).getTime() - new Date(args.start_time).getTime()) < parseInt(args.test_duration)) {
    throw "End time minus starttime cannot be samller than test duration.";
  }
  return '';
}

export async function parseAndValidateTest(args, ctx) {
  try {
    validateTestInfo(args); //validaion of user inputs
    let lang = "english";
    //'hindi','telugu','tamil','kannada','sanskrit'
    if (args.subject_name.toLowerCase() === "telugu" ||
      args.subject_name.toLowerCase() === "hindi" ||
      args.subject_name.toLowerCase() === "tamil" ||
      args.subject_name.toLowerCase() === "kannada" ||
      args.subject_name.toLowerCase() === "sanskrit") {
      lang = args.subject_name.toLowerCase();
    }
    let data = await fileUpload.s3GetFileData(args.file_key);
    const mimeType = {
      "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "xml": "text/xml"
    }
    const file_id = args.file_key;
    const url = config.parser.uri + "?subject=" + lang + "&file_id=" + file_id;
    const file_data = data.data;
    const option = {
      method: "POST",
      url: url
    }
    const name = args.file_key.split("/")[1];
    const contetType = mimeType[name.split(".").pop()];
    let parsedData = await parseFile(option, name, contetType, file_data);
    let test = await createTest(args, ctx);
    const jsonifiedData = JSON.parse(parsedData);
    let errorQuestions = jsonifiedData.filter((question) => {
      return question.errors.length > 0;
    });
    let errorQuestionNumbers = errorQuestions.map((question) => {
      return question.qno;
    });
    let percentageError = (errorQuestions.length / jsonifiedData.length) * 100;
    await setQuestionInDb(jsonifiedData, ctx, test["_id"], args.file_key);
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

//This function taken in any number of date object and return whether they are equal in terms of year, month and date.
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
        code: args.class_code,
          name: args.class_name
      },
      subject: {
        code: args.subject_code,
        name: args.subject_name
      },
      textbook: {
        code: args.textbook_code,
        name: args.textbook_name
      }
    },
    test: {
      name: args.test_name,
      start_time: new Date(args.start_time),
      end_time: new Date(args.end_time),
      date: new Date(args.test_date),
      duration: parseInt(args.test_duration)
    },
    marking_scheme: args.marking_schema,
    file_key: args.file_key,
    active: false
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
