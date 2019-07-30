import _ from 'lodash';

import { config } from '../../../config/environment';
import { getModel as SubjectModel } from '../../settings/subject/subject.model';
import { getModel as TextbookModel } from '../../settings/textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../../settings/conceptTaxonomy/concpetTaxonomy.model';
import { getModel as ContentMappingModel } from '../../settings/contentMapping/contentMapping.model';

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

/**
 *
 * @author Aditi
 * @description Returns a array of jsons for csv conversion based with name of asset
 *              already entered into sheet
 *
 * */
export function downloadContentMappingSample(req, res) {
  if (!req || !req.body) {
    throw new Error('Please provide with the inputs');
  }
  const args = req.body;
  if (!args.uploadList) {
    throw new Error('Need atleast one entry');
  }
  const result = [];
  const headers = ['name', 'subject', 'textbook', 'chapter', 'contentType', 'coins'];
  const uploadList = JSON.parse(args.uploadList);
  for (let i = 0; i < uploadList.length; i += 1) {
    const row = {};
    const obj = uploadList[i];
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = obj[headers[j]] ? obj[headers[j]] : '';
    }
    result[i] = row;
  }
  res.send(result);
}

// validate uploaded sheet for content mapping
export function validateUploadedContentMapping(req) {
  let uploadList = req.body.uploadList;
  uploadList = JSON.parse(uploadList);
  const classCode = req.body.classCode;
  // console.log('im heer');
  // Reading  workbook
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
  // converting the sheet data to csv
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
  // deleting all trailing empty rows
  for (let i = data.length - 1; i >= 0; i -= 1) {
    let values = Object.values(data[i]);
    values = values.map(x => x.toString());
    // const vals = values.map(x => x.trim());
    if (values.every(x => x === '')) data.pop();
    else break;
  }
  const error = {
    E0001: [], // Null value Error(Missing information)
    E0002: [], // Invalid coins input
    E0003: [], // Subjects/Textbooks not existing in database
    E0004: [], // Count mismatch between comma separated values
    E0005: [], // invalid subject-textbook combination
    E0006: [], // invalid chapter-textbook combination
    E0007: [], // Name mismatch Error
    E0008: [], // Invalid File Type
  };

  // checking for null values error code : E0001
  for (let i = 0; i < data.length; i += 1) {
    const temp = data[i];
    const err1 = [];
    temp.coins = String(temp.coins).trim();
    console.log('temp1111111', temp);
    let coins = temp.coins;
    const name = temp.name.trim();
    const subject = temp.subject.trim();
    const textbook = temp.textbook.trim();
    const contentType = temp.contentType.trim();
    const chapter = temp.chapter.trim();
    console.log('temp', temp);
    if (name == null || name === '') {
      err1.push('name');
    }
    if (subject == null || subject === '') {
      err1.push('subject');
    }
    if (textbook == null || textbook === '') {
      err1.push('textbook');
    }
    if (chapter == null || chapter === '') {
      err1.push('chapter');
    }
    if (coins == null || coins === '') {
      err1.push('coins');
    }
    console.log('err1', err1);
    coins = parseInt(coins);
    temp.coins = coins;
    // validating coins
    if (coins && coins < 0 || typeof (coins) !== 'number') {
      error.E0002.push(`Coins can not be less than 0 or anything other than number at row : ${i + 2}`);
    }
    if (contentType == null || contentType === '') {
      err1.push('Content Type');
    }
    if (err1.length > 0) {
      error.E0001.push(`missing information at columns ${err1} at row ${i + 2}`);
    }
  }
  console.log('error', error);
  let subjectList = [];
  let textbookList = [];

  // splitting individual columns
  data.map((x) => {
    x.subject = x.subject.split(',');
    for (let i = 0; i < x.subject.length; i++) {
      x.subject[i] = x.subject[i].trim();
    }
    x.textbook = x.textbook.split(',');
    for (let i = 0; i < x.textbook.length; i++) {
      x.textbook[i] = x.textbook[i].trim();
    }
    x.chapter = x.chapter.split(',');
    for (let i = 0; i < x.chapter.length; i++) {
      x.chapter[i] = x.chapter[i].trim();
    }
    subjectList = subjectList.concat(x.subject);
    textbookList = textbookList.concat(x.textbook);
  });
  textbookList = [...new Set(textbookList)];
  subjectList = [...new Set(subjectList)];

  return Promise.all([
    SubjectModel(req.user_cxt),
    TextbookModel(req.user_cxt),
  ]).then(([subjects, textbooks]) => Promise.all([
    subjects.find({ subject: { $in: subjectList } }, { _id: 0, subject: 1 }),
    textbooks.find({ name: { $in: textbookList }, 'refs.class.code': classCode }, {
      _id: 0, name: 1, code: 1, orientations: 1, branches: 1, publisher: 1,
    }),
  ]).then(([sList, tList]) => {
    const subList = sList.map(x => x.subject);
    const tbookList = tList.map(x => x.name);
    let subdifference = subjectList.filter(x => !subList.includes(x));
    // invalid subject error code E0003
    subdifference = subdifference.filter(x => x != '');
    if (subdifference.length >= 1) {
      error.E0003.push(`Subjects not existing in database : ${subdifference}`);
    }
    let textbookdifference = textbookList.filter(x => !tbookList.includes(x));
    textbookdifference = textbookdifference.filter(x => x != '');
    // invalid textbook error code E0004
    if (textbookdifference.length >= 1) {
      error.E0003.push(`Textbooks not existing in database : ${textbookdifference}`);
    }
    const subtextQuery = {};
    subtextQuery.$or = [];

    const chaptextQuery = {};
    chaptextQuery.$or = [];
    chaptextQuery.levelName = 'topic';
    let j = 0;

    // checking for subject-textbook combinations
    for (let i = 0; i < data.length; i += 1) {
      const tempObj = data[i];
      if (tempObj.subject && tempObj.textbook) {
        if (tempObj.subject.length !== tempObj.textbook.length) {
          error.E0004.push(`Count mismatch between Subject and TextBook at row : ${i + 2}`);
        }

        if ((tempObj.subject.length !== tempObj.chapter.length) ||
          (tempObj.textbook.length !== tempObj.chapter.length)) {
          error.E0004.push(`Count mismatch between Subject-TextBook and Chapter at row : ${i + 2}`);
        }

        for (let k = 0; k < tempObj.subject.length; k += 1) {
          subtextQuery.$or[j] = {
            'refs.subject.name': tempObj.subject[k],
            name: tempObj.textbook[k],
          };
          const textBookCode = tList.find(x => x.name === tempObj.textbook[k]) ?
            tList.find(x => x.name === tempObj.textbook[k]).code : null;

          chaptextQuery.$or[j++] = {
            'refs.textbook.code': textBookCode,
            child: tempObj.chapter[k],
          };
        }
      }
    }
    return (textbooks.find(subtextQuery, {
      _id: 0,
      name: 1,
      'refs.subject.name': 1,
      code: 1,
      publisher: 1,
      orientations: 1,
      branches: 1,
    })).then((subtextList) => {
      // let subtextMismatch = []
      for (let i = 0; i < data.length; i += 1) {
        const temp = data[i];
        if (temp.subject && temp.textbook) {
          for (let j = 0; j < temp.subject.length; j += 1) {
            const check = subtextList.find(x => x.refs.subject.name === temp.subject[j] &&
              x.name === temp.textbook[j]);
            if (check === undefined) {
              error.E0005.push(`invalid subject-textbook combination at row : ${i + 2}`);
            }
          }
        }
      }
      return ConceptTaxonomyModel(req.user_cxt).then(conceptTaxonomy => conceptTaxonomy.find(chaptextQuery, {
        _id: 0, child: 1, 'refs.textbook.code': 1, childCode: 1, 'refs.textbook.name': 1,
      }).then((topicList) => {
        // let chaptextMismatch = []
        for (let i = 0; i < data.length; i += 1) {
          const temp = data[i];
          if (temp.subject && temp.textbook) {
            for (let j = 0; j < temp.subject.length; j += 1) {
              const textBookCode = tList.find(x => x.name === temp.textbook[j]) ?
                tList.find(x => x.name === temp.textbook[j]).code : null;
              const check = topicList.find(x => x.refs.textbook.code === textBookCode && x.child === temp.chapter[j]);
              if (check === undefined) {
                error.E0006.push(`invalid chapter-textbook combination at row : ${i + 2}`);
              }
            }
            const u = uploadList.find(x => x.name === temp.name);
            if (u === undefined || u === null) {
              error.E0007.push(`Name mismatch at row : ${i + 2}`);
            }
          }
        }

        let count = 0;
        const keys = error && Object.keys(error) ? Object.keys(error) : [];
        for (let j = 0; j < keys.length; j += 1) {
          if (error[keys[j]].length > 0) {
            // return error
            count += 1;
          } else {
            delete error[keys[j]];
          }
        }
        if (count > 0) {
          return error;
        }
        // preparing documents for insertion
        return ContentMappingModel(req.user_cxt).then((contentMapping) => {
          const bulk = contentMapping.collection.initializeUnorderedBulkOp();
          const finalObj = [];
          let k = 0;
          for (let i = 0; i < data.length; i += 1) {
            const temp = data[i];
            for (let j = 0; j < temp.subject.length; j += 1) {
              const textBookCode = tList.find(x => x.name === temp.textbook[j]).code;
              const t = topicList.find(x => x.refs.textbook.code === textBookCode &&
               x.child === temp.chapter[j]);
              const s = subtextList.find(x => x.refs.subject.name === temp.subject[j] &&
              x.name === temp.textbook[j]);
              const u = uploadList.find(x => x.name === temp.name);
              const setobj = {};
              const whereObj = {};
              whereObj['content.name'] = temp.name;
              whereObj['refs.textbook.code'] = s.code;
              whereObj['refs.topic.code'] = t.childCode;
              whereObj.active = true;
              setobj.content = {
                name: temp.name,
                category: req.body.contentCategory,
                type: temp.contentType,
              };
              setobj.resource = {
                key: u.key,
                size: u.fileSize,
                type: u.fileType,
              };
              setobj['publication.publisher'] = s.publisher;
              setobj['publication.year'] = null;
              setobj.coins = temp.coins;
              setobj.active = true;
              setobj.refs = {
                topic: {
                  code: t.childCode,
                },
                textbook: {
                  code: s.code,
                },
              };
              setobj.category = '';
              setobj.orientation = s.orientations;
              setobj.branches = s.branches;
              finalObj[k++] = setobj;
              bulk.find(whereObj).upsert().updateOne(setobj);
            }
          }

          return bulk.execute().then(obj => `${req.file.originalname} : Uploaded successfully`).catch(err => 'Error occured while uploading');
        });
      }));
    });
  }));
}
// Upload content Mapping provided in a xlsx file.
export async function uploadedContentMapping(req, res) {
  console.log('req', req.file);
  console.log('req', req.body);
  if (!req) {
    const error = 'No request received';
    return res.status(400).send(error).end();
    // throw new Error(err);
  }
  if (!req.file) {
    const error = 'File required';
    return res.status(400).send(error).end();
  }
  if (!req.body || !req.body.contentCategory) {
    const error = 'content category required';
    return res.status(400).send(error).end();
  }
  if (!req.body || !req.body.classCode) {
    const error = 'ClassCode required';
    return res.status(400).send(error).end();
  }
  if (!req.body || !req.body.uploadList) {
    const error = 'List required';
    return res.status(400).send(error).end();
  }
  // vaidating file type
  const error = {};
  const name = req.file.originalname.split('.');
  const extname = name[name.length - 1];
  if (extname !== 'xlsx') {
    error.E0008 = 'Invalid File Type';
    return res.status(400).send(error).end();
  }

  return validateUploadedContentMapping(req).then((done) => {
    if (done.error) {
      res.status(400).send(done.error).end();
    }
    res.status(200).send(done).end();
  });
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
  uploadedContentMapping,
};
