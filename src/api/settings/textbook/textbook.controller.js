/* eslint-disable */
import {
  getModel as ConcpetTaxonomyModel
} from '../conceptTaxonomy/concpetTaxonomy.model';

import {
  getModel as TextbookModel
} from './textbook.model';
import {
  getModel as InstituteHierarchyModel
} from '../instituteHierarchy/instituteHierarchy.model'
import {
  getModel as SubjectModel
} from '../subject/subject.model'
import {
  getModel as StudentModel
} from '../student/student.model'
import {
  getUniqueDataForValidation,
  getUniqueBranchesForValidation
} from '../contentMapping/contentMapping.controller';
import {
  config
} from '../../../config/environment';
import {
  text
} from 'body-parser';

const crypto = require('crypto')
const _ = require('lodash')
const xlsx = require('xlsx');

export async function getStudentData(context) {
  const {
    studentId
  } = context;
  return StudentModel(context).then((Student) => {
    if (!studentId) return false;
    const project = {
      _id: 0,
      subjects: 1,
      hierarchy: 1,
      orientation: 1,
      active: true,
    }
    return Student.findOne({
      studentId
    }, project)
  })
}

function getTextbooksQuery(args) {
  const query = {
    active: true,
  }
  if (args.classCode) query['refs.class.code'] = args.classCode;
  if (args.subjectCode) query['refs.subject.code'] = args.subjectCode;
  if (args.orientation) {
    query['orientations'] = {
      $in: [null, "", args.orientation]
    }
  }
  if (args.branch) {
    query['branches'] = {
      $in: [null, "", args.branch]
    }
  }
  return query
}
export async function getTextbooks(args, context) {
  return getStudentData(context).then((obj) => {
    if (obj && obj.orientation) {
      args.orientation = obj.orientation
      const {
        hierarchy
      } = obj;
      if (hierarchy && hierarchy.length) {
        const branchData = hierarchy.find(x => x.level === 5);
        if (branchData && branchData.child) args.branch = branchData.child;
      }
    }
    const query = getTextbooksQuery(args)
    return TextbookModel(context).then((Textbook) => {
      return Textbook.find(query)
    })
  })
}

export async function getTextbooksByPagination(args, context) {
  return getStudentData(context).then((obj) => {
    if (obj && obj.orientation) {
      args.orientation = obj.orientation
      const {
        hierarchy
      } = obj;
      if (hierarchy && hierarchy.length) {
        const branchData = hierarchy.find(x => x.level === 5);
        if (branchData && branchData.child) args.branch = branchData.child;
      }
    }
    const query = getTextbooksQuery(args)
    const skip = (args.pageNumber - 1) * args.limit;
    return TextbookModel(context).then((Textbook) => {
      return Promise.all([Textbook.count(query), Textbook.find(query).skip(skip).limit(args.limit)]).then(([count, data]) => {
         count = count ? count: 0;
         data = data && data.length ? data:[];
      return {
        data,
        count
      }
    })
  })
})
}

export async function getHierarchyData(context, hierarchyCodes) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    const query = {
      active: true,
      childCode: {
        $in: hierarchyCodes
      }
    }
    const projection = {
      _id: 0,
      child: 1,
      childCode: 1,
      parentCode: 1,
      levelName: 1
    }
    return InstituteHierarchy.find(query, projection)
  })
}

export async function getSubjectData(context, args) {
  const findQuery = {
    code: args.subjectCode,
    'refs.class.code': args.classCode,
    active: true
  }
  return SubjectModel(context).then((Subject) => {
    return Subject.findOne(findQuery);
  })
}

export async function validateTextbook(args, context) {
  const query = {
    active: true,
    name: args.name,
    'refs.class.code': args.classCode,
    'refs.subject.code': args.subjectCode,
  }
  return TextbookModel(context).then((Textbook) => {
    return Textbook.findOne(query).then((obj) => {
      if (obj) return true
      return false
    })
  })
}

function validateUrl(value) {
  return true;
  // return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

export async function createTextbook(args, context) {
  args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
  args.publisher = args.publisher ? args.publisher.replace(/\s\s+/g, ' ').trim() : ''
  if (args.orientations) {
    const items = []
    args.orientations.forEach(element => {
      if (element) items.push(element)
    });
    if (items.length) args.orientations = items;
    else args.orientations = null;
  }
  if (args.branches) {
    const items = []
    args.branches.forEach(element => {
      if (element) items.push(element)
    });
    if (items.length) args.branches = items;
    else args.branches = null;
  }
  if (
    !args.name ||
    !args.classCode ||
    !args.subjectCode
  ) {
    throw new Error('Insufficient data');
  }
  return validateTextbook(args, context).then((isTextbookExist) => {
    if (isTextbookExist) throw new Error('Textbook already exists')
    return Promise.all([
      getHierarchyData(context, [args.classCode]),
      getSubjectData(context, args),
      TextbookModel(context)
    ]).then(([
      hierarchyData,
      subjectData,
      Textbook
    ]) => {
      const classData = hierarchyData.find(x => x.levelName === 'Class' && x.childCode === args.classCode)
      if (
        !classData ||
        !subjectData
      ) {
        throw new Error('Invalid input codes ')
      }
      const obj = {
        name: args.name,
        code: `${Date.now()}${crypto.randomBytes(5).toString('hex')}`,
        imageUrl: args.imageUrl,
        publisher: args.publisher,
        orientations: args.orientations,
        branches: args.branches,
        refs: {
          class: {
            name: classData.child,
              code: classData.childCode,
          },
          subject: {
            name: subjectData.subject,
            code: subjectData.code,
          }
        }
      }
      return Textbook.create(obj)
    })
  })

}

export async function validateTextbookForUpdate(args, context) {
  let query = {
    active: true,
    code: args.code,
  }
  return TextbookModel(context).then((Textbook) => {
    return Textbook.findOne(query).then((obj) => {
      if (!obj) throw new Error('Textbook not found with given code')
      if (args.name) {
        query = {
          active: true,
          name: args.name,
          code: {
            $ne: args.code
          },
          'refs.class.code': obj.refs.class.code,
          'refs.subject.code': obj.refs.subject.code
        }
        return Textbook.findOne(query).then((doc) => {
          if (doc) throw new Error('Textbook name already exists')
          return Textbook;
        })
      }
      return Textbook;
    })
  })
}


export async function updateTextbook(args, context) {
  args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
  args.publisher = args.publisher ? args.publisher.replace(/\s\s+/g, ' ').trim() : ''
  if (
    !args.code ||
    (!args.name && !args.imageUrl && !args.publisher && !args.orientations)
  ) {
    throw new Error('Insufficient data')
  }
  if (args.imageUrl && !validateUrl(args.imageUrl)) {
    throw new Error('Invalid image url')
  }

  if (args.orientations) {
    const items = []
    args.orientations.forEach(element => {
      if (element) items.push(element)
    });
    if (items.length) args.orientations = items;
    else args.orientations = null;
  }

  if (args.branches) {
    const items = []
    args.branches.forEach(element => {
      if (element) items.push(element)
    });
    if (items.length) args.branches = items;
    else args.branches = null;
  }

  return validateTextbookForUpdate(args, context).then((Textbook) => {
    const matchQuery = {
      active: true,
      code: args.code,
    }
    const patch = {}
    if (args.name) patch.name = args.name
    if (args.imageUrl) patch.imageUrl = args.imageUrl
    if (args.publisher) patch.publisher = args.publisher
    if (args.orientations) patch.orientations = args.orientations;
    if (args.branches) patch.branches = args.branches;
    return Textbook.updateOne(matchQuery, patch).then(() => {
      return Textbook.findOne(matchQuery)
    })
  })
}

export async function deleteTextbook(args, context) {
  if (!args.code) throw new Error('Code is requried')
  return TextbookModel(context).then((Textbook) => {
    const query = {
      active: true,
      code: args.code
    }
    const patch = {
      active: false
    }
    return Textbook.findOneAndUpdate(query, patch).then((doc) => {
      if (!doc) throw new Error('Textbook not found with given code')
      return doc
    })
  })
}

export async function codeAndTextbooks(context) {
  return TextbookModel(context).then((Textbook) => {
    const query = {
      active: true
    };

    const aggregateQuery = [{
        $match: {
          'active': true
        }
      },
      {
        "$group": {
          "_id": {
            "code": "$code",
            "data": {
              "subject": "$refs.subject.name",
              "class": "$refs.class.name",
              "name": "$name",
              "branches": "$branches",
              "orientations": "$orientations"
            }
          }
        }
      },
      {
        "$group": {
          "_id": null,
          "data": {
            "$push": {
              "k": "$_id.code",
              "v": "$_id.data"
            }
          }
        }
      }, {
        "$replaceRoot": {
          "newRoot": {
            "$arrayToObject": "$data"
          }
        }
      },
    ]

    return Textbook.aggregate(aggregateQuery).then((docs) => {
      if (!docs || docs.length < 1) {
        return {};
      }
      return docs
    })

  })
}

export async function getUniqueOrientationForValidation(context) {
  return StudentModel(context).then(Student => Student.distinct('orientation', {
    active: true
  }));
}

function cleanUploadBranchAndOrientationiMappingTextbookData(data) {
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

  // trim and remove whitespace and chaging keys to lower case
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

function  validateUploadBranchAndOrientationiMappingTextbookData(data, dbData, uniqueBranches, uniqueOrientations) {
  const result = {
    success: true,
    message: 'Invalid data',
    errors: [],
  };
  const errors = [];
  const uniqueBranchesObj = {};
  uniqueBranches.forEach(x => {
    uniqueBranchesObj[x.toLowerCase()] = x;
  })
  const uniqueBranchesLower = Object.keys(uniqueBranchesObj);

  const uniqueOrientationsObj = {};
  uniqueOrientations.forEach(x => {
    uniqueOrientationsObj[x.toLowerCase()] = x;
  })
  const uniqueOrientationsLower = Object.keys(uniqueOrientationsObj);

  const mandetoryFields = [
    'class', 'subject', 'textbook', 'orientations', 'branches'
  ];

  for (let i = 0; i < data.length; i += 1) {
    const row = i + 2;
    const obj = data[i];
    let isMandateAllExists = true;
    mandetoryFields.forEach(x => {
      if (!obj[x]) {
        isMandateAllExists = false;
        result.success = false,
          result.message = `Row ${row}, No value found for ${x.toUpperCase()}`;
        errors.push(result.message);
      }
    })

    if (!isMandateAllExists) continue;

    if (!dbData[obj.class.toLowerCase()]) {
      result.success = false;
      result.message = `Row ${row}, Invalid CLASS (${obj.class})`;
      errors.push(result.message);
      continue;
    }

    if (!dbData[obj.class.toLowerCase()][obj.subject.toLowerCase()]) {
      result.success = false;
      result.message = `Row ${row}, Invalid SUBJECT (${obj.subject})`;
      errors.push(result.message);
      continue;
    }

    const textbookCode = dbData[obj.class.toLowerCase()][obj.subject.toLowerCase()][obj.textbook.toLowerCase()];
    if (!textbookCode) {
      result.success = false;
      result.message = `Row ${row}, Invalid TEXTBOOK (${obj.textbook})`;
      errors.push(result.message);
      continue;
    }

    obj.textbookCode = textbookCode;

    // validate and set branches
    let branches = obj.branches.split(',').map(x => x.toString().replace(/\s\s+/g, ' ').trim()).filter(x => x).map(x => x.replace('-', ' '))
    const insheetBranches = {}
    branches.forEach(x => {
      insheetBranches[x.toLowerCase()] = x;
    })
    branches = Object.keys(insheetBranches);

    if (!branches.length) {
      result.success = false;
      result.message = `Row ${row}, No Branches found`;
      errors.push(result.message);
      continue;
    }
    let diffBranches = _.difference(branches, uniqueBranchesLower);
    if (diffBranches.length) {
      diffBranches = diffBranches.map(x => insheetBranches[x]);
      result.success = false;
      result.message = `Row ${row}, Invalid Branches (${diffBranches.toString()})`;
      errors.push(result.message);
      continue;
    }
    const finalBranches = [];
    branches.forEach(x => {
      finalBranches.push(uniqueBranchesObj[x]);
    })
    obj.branches = finalBranches;

    // validate and set orientations
    let orientations = obj.orientations.split(',').map(x => x.toString().replace(/\s\s+/g, ' ').trim()).filter(x => x);
    const insheetOrientations = {};
    orientations.forEach(x => {
      insheetOrientations[x.toLowerCase()] = x
    });
    orientations = Object.keys(insheetOrientations);

    if (!orientations.length) {
      result.success = false;
      result.message = `Row ${row}, No Orientations found`;
      errors.push(result.message);
      continue;
    }
    let diffOrientations = _.difference(orientations, uniqueOrientationsLower);
    if (diffOrientations.length) {
      diffOrientations = diffOrientations.map(x => insheetOrientations[x]);
      result.success = false;
      result.message = `Row ${row}, Invalid Orientations (${diffOrientations.toString()})`;
      errors.push(result.message);
      continue;
    }
    const finalOrientations = [];
    orientations.forEach(x => {
      finalOrientations.push(uniqueOrientationsObj[x]);
    })
    obj.orientations = finalOrientations;

    if(obj['view order']) {
      obj['view order'] = Number(obj['view order'])
      if(!obj['view order']) {
        result.success = false;
        result.message = `Row ${row}, Invalid VIEW ORDER (${obj['view order']})`;
        errors.push(result.message);
      }
    }
  }

  if (errors.length) result.errors = errors;
  return result;

}
export async function uploadBranchAndOrientationiMappingTextbook(req, res) {
  if (!req.file) return res.status(400).end('File required');

  // validate extension
  const name = req.file.originalname.split('.');
  const extname = name[name.length - 1];
  if (extname !== 'xlsx') {
    return res.status(400).end('Invalid extension, please upload .xlsx file');
  }
  const workbook = xlsx.read(req.file.buffer, {
    type: 'buffer',
    cellDates: true
  });
  // converting the sheet data to csv
  let data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  data = cleanUploadBranchAndOrientationiMappingTextbookData(data);

  if (!data.length) return res.status(400).end('No Data found');
  return Promise.all([
    getUniqueDataForValidation(req.user_cxt),
    getUniqueBranchesForValidation(req.user_cxt),
    getUniqueOrientationForValidation(req.user_cxt),
    TextbookModel(req.user_cxt),
  ]).then(([dbData, uniqueBranches, uniqueOrientations, Textbook]) => {
    const validate = validateUploadBranchAndOrientationiMappingTextbookData(data, dbData, uniqueBranches, uniqueOrientations);
    if (!validate.success) {
      validate.message = 'Invalid data'
      return res.send(validate);
    }
    const bulk = Textbook.collection.initializeUnorderedBulkOp();
    data.forEach(obj => {
      const query = {
        active: true,
        code: obj.textbookCode
      };
      const patch = {
        $set: {
          branches: obj.branches,
          orientations: obj.orientations
        }
      };
      if(obj['view order']) {
        patch.$set.viewOrder = obj['view order'];
      }
      bulk.find(query).updateOne(patch);
    })
    bulk.execute().then(() => {
      return res.send({
        message: 'Succeccfully updated'
      })
    }).catch(err => {
      console.error(err);
      return res.status(400).end('Something went wrong');
    })
  }).catch(err => {
    console.error(err);
    return res.status(400).end('Something went wrong');
  })
}

export async function checkStudentHasTextbook(args, ctx) {
  try {
    const TextBookSchema = await TextbookModel(ctx);
    let findQuery = {
      code: args.textbookCode,
      orientations: args.orientationOfStudent,
      branches: args.branchOfStudent,
      "refs.class.code": args.classOfStudent
    };
    const textBook = await TextBookSchema.findOne(findQuery).lean();
    return textBook
  } catch (err) {
    throw err;
  }
}

//Based on the orientation, branch, class and subject of teacher
export async function getTextbookForTeachers(args, context) {
  try{
    const Textbook = await TextbookModel(context);
    let findQuery = {}
    if(args.branch ){
      findQuery["branches"] = args.branch
    }
    if(args.orientation){
      findQuery["orientations"] = args.orientation
    }
    if(args.classCode){
      findQuery["refs.class.code"] = args.classCode
    }
    if(args.subjectCode){
      findQuery["refs.subject.code"] = args.subjectCode
    }

    const textbooks = await Textbook.find(findQuery).lean();
    const textbookCodes = textbooks.map(obj => obj.code);
    return textbookCodes;
  }catch(err){
    throw err;
  }
}
export async function getChapterWiseTextbookList(args, context) {
  const [Textbook, ConcpetTaxonomy, Subject] = await Promise.all([
    TextbookModel(context),
    ConcpetTaxonomyModel(context),
    SubjectModel(context)]);
  if (!args && !args.classCode && !args.subjectCode && !args.textbookCode) {
    throw new Error('Nothing is Provided');
  }
  const skip = (args.pageNumber - 1) * args.limit;
  const { classCode, subjectCode, textbookCode } = args;
  const subjectQuery = { active: true, viewOrder: { $ne: null } }
  const textbookQuery = { active: true, viewOrder: { $ne: null } }
  const conceptTaxonomyQuery = { active: true, viewOrder: { $ne: null }, levelName: "topic" }
  const classSearchKey = "refs.class.code";
  const subjectSearchKey = "refs.subject.code";
  const textbookSearchKey = "refs.textbook.code";

  if (classCode) {
    subjectQuery[classSearchKey] =classCode
    textbookQuery[classSearchKey] = classCode
  }
  if (subjectCode) {
    subjectQuery.code = subjectCode
    textbookQuery[subjectSearchKey] = subjectCode

  }
    if (textbookCode) {
      textbookQuery.code = textbookCode
      conceptTaxonomyQuery[textbookSearchKey] = textbookCode
    }
    const projectionForSubject = {
      subject: 1,
      _id: 0,
      code: 1,
      viewOrder: 1,
      refs: 1
    }
    const projectionForTextbook = {
      name: 1,
      _id: 0,
      code: 1,
      viewOrder: 1,
      refs: 1,
      imageUrl: 1
    }
    const projectionForConceptTaxonomies = {
      viewOrder: 1,
      code: 1,
      child: 1,
      refs: 1
    }
    let resArray = [];
          let subjectObject = {}
          let textbookObject = {}
          let textbookCodes = []
          let classCodes = []
          let subjectCodes = []
          let subjectData = await Subject.find(subjectQuery, projectionForSubject).sort({ "refs.class.name": 1 });
          subjectData.forEach(subject => {
            subjectObject[subject.code] = subject
            classCodes.push(subject.refs.class.code)
            subjectCodes.push(subject.code)
          })
          if (!classCode) {
            textbookQuery[classSearchKey] = {
              $in: classCodes
            }
            textbookQuery[subjectSearchKey] = {
              $in: subjectCodes
            }
          }
          let textbookData = await Textbook.find(textbookQuery, projectionForTextbook);
          textbookData.forEach(textbook => {
            textbookObject[textbook.code] = textbook
            textbookCodes.push(textbook.code)
          })
          if (!textbookCode) {
            conceptTaxonomyQuery[textbookSearchKey] = {
              $in: textbookCodes
            }
          }
          let concpetTaxonomyData = await ConcpetTaxonomy.find(conceptTaxonomyQuery, projectionForConceptTaxonomies).sort({ "viewOrder": 1 }).skip(skip).limit(args.limit);
          let count = await ConcpetTaxonomy.count(conceptTaxonomyQuery);
          concpetTaxonomyData.forEach(concpetTaxonomy => {
            let textbookCode = concpetTaxonomy.refs.textbook.code
            let tempTextbookObj = textbookObject[textbookCode];
            let tempSujectCode = tempTextbookObj.refs.subject.code
            let tempSubjectObj = subjectObject[tempSujectCode];
            const data = {
              class: {
                name: tempTextbookObj.refs.class.name,
                code: tempTextbookObj.refs.class.code,
              },
              subject: {

                name: tempSubjectObj.subject,
                code: tempSubjectObj.code,
                viewOrder: tempSubjectObj.viewOrder,
              },
              textbook: {
                name: tempTextbookObj.name,
                code: tempTextbookObj.code,
                viewOrder: tempTextbookObj.viewOrder,
                imageUrl: tempTextbookObj.imageUrl,
              },
              chapter: {
                name: concpetTaxonomy.child,
                code: concpetTaxonomy.code,
                viewOrder: concpetTaxonomy.viewOrder,
              }
            }
    resArray.push(data)
  })
  count = count ? count : 0;
  const data = resArray && resArray.length ? resArray : [];

  return [count, data];
}

export default {
  getHierarchyData
}
