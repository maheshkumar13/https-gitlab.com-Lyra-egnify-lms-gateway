import stream from 'stream';
import _ from 'lodash';

const json2csv = require('json2csv').parse;

const { Duplex } = stream;

export function convertData(req, res) {
  const csvJson = [];
  const IntegerQuestionList = {};
  const QuestionList = [];
  const fields = ['Student Id'];
  if (!req.body.testpattern) {
    res.status(404).send('No Test Pattern Given');
  }
  if (!req.files.file || !req.files.key) {
    res.status(404).send('No Test Pattern Given');
  }

  const testPattern = JSON.parse(req.body.testpattern);
  const { subjects } = testPattern;
  _.forEach(subjects, (subject) => {
    const sections = subject.marks;
    _.forEach(sections, (section) => {
      const numberOfQuestions = parseInt(section.numberOfQuestions);
      const numberOfSubQuestions = parseInt(section.numberOfSubQuestions);
      if (numberOfQuestions === numberOfSubQuestions) {
        for (let i = section.start; i <= section.end; i += 1) {
          fields.push(`Q${i}`);
          QuestionList.push(`Q${i}`);
          if (section.questionType === 'Integer Type') {
            IntegerQuestionList[`Q${i}`] = true;
          }
        }
      } else {
        for (let j = section.start; j <= section.end; j += 1) {
          for (let k = 0; k < (numberOfSubQuestions / numberOfQuestions); k += 1) {
            const chr = String.fromCharCode(97 + k);
            fields.push(`Q${j}${chr}`);
            QuestionList.push(`Q${j}${chr}`);
            if (section.questionType === 'Integer Type') {
              IntegerQuestionList[`Q${j}${chr}`] = true;
            }
          }
        }
      }
    });
  });
  csvJson.push(fields);

  const fileBuffer = req.files.file[0].buffer;
  const fileCsvString = fileBuffer.toString('ascii', 0, fileBuffer.length);
  const keyBuffer = req.files.key[0].buffer;
  const keyCsvString = keyBuffer.toString('ascii', 0, keyBuffer.length);
  const answerKey = _.split(keyCsvString, ',');
  const studentResponseList = _.split(fileCsvString, '\n');
  _.forEach(studentResponseList, (studentResponse) => {
    const row = [];
    const studentResponseArray = _.split(studentResponse, ',');
    if (_.trim(studentResponseArray[1]) !== '') {
      row.push(studentResponseArray[1]);
      for (let i = 0; i < QuestionList.length; i += 1) {
        if (answerKey[i + 2] === '-1') {
          row.push('ADD');
        } else if (answerKey[i + 2] === '0' && !IntegerQuestionList[QuestionList[i]]) {
          row.push('ADD');
        } else if (studentResponseArray[i + 2] === '-1') {
          row.push('U');
        } else if (studentResponseArray[i + 2] === answerKey[i + 2]) {
          row.push('C');
        } else if (studentResponseArray[i + 2] !== answerKey[i + 2]) {
          if (studentResponseArray[i + 2] === '0') {
            row.push('U');
          } else {
            row.push('W');
          }
        }
      }
      csvJson.push(row);
    }
  });


  const opts = { header: false };
  let csv = null;
  try {
    csv = json2csv(csvJson, opts);
  } catch (err) {
    console.error(err);
  }
  if (!csv) {
    res.statusMessage = 'Error in generation CSV Report';
    res.status(404).send('Error in generation CSV Report');
  }
  res.attachment('convertedData.csv');
  res.status(200).send(csv);
}

export default {
  convertData,
};
