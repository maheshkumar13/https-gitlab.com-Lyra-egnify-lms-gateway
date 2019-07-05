/* eslint-disable */
import { getModel as SubjectModel } from '../subject/subject.model';
import { getModel as TextbookModel } from '../textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../conceptTaxonomy/concpetTaxonomy.model';
import { getModel as ContentMappingModel } from './contentMapping.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import { getModel as studentInfoModel } from '../student/student.model';

import { config } from '../../../config/environment';
import { getStudentData } from '../textbook/textbook.controller';



const xlsx = require('xlsx');
const upath = require('upath');
const crypto = require('crypto');
const mongoose = require('mongoose');

export async function getTextbookWiseTopicCodes(context) {
  return ConceptTaxonomyModel(context).then((ConceptTaxonomy) => {
    const aggregateQuery = [];

    aggregateQuery.push({
      $match: {
        active: true,
        levelName: 'topic',
      },
    });

    aggregateQuery.push({
      $group: {
        _id: '$refs.textbook.code',
        codes: { $push: { code: '$code', name: '$child' } },
      },
    });

    return ConceptTaxonomy.aggregate(aggregateQuery).then((docs) => {
      const finalData = {};
      docs.forEach((e) => {
        e.codes = e.codes.map((x) => {
          x.name = x.name.toLowerCase();
          return x;
        });
        finalData[e._id] = e.codes;
      });
      return finalData;
    });
  });
}

export async function getUniqueDataForValidation(context) {
  return TextbookModel(context).then((Textbook) => {
    const aggregateQuery = [];
    const match = {
      active: true,
    };

    aggregateQuery.push({
      $match: match,
    });

    aggregateQuery.push({
      $group: {
        _id: {
          class: '$refs.class.name',
          subject: '$refs.subject.name',
          textbook: '$name',
          code: '$code',
        },
      },
    });


    return Textbook.aggregate(aggregateQuery).allowDiskUse(true).then((data) => {
      const finalData = {};
      data.forEach((e) => {
        e._id.class = e._id.class.toLowerCase();
        e._id.subject = e._id.subject.toLowerCase();
        e._id.textbook = e._id.textbook.toLowerCase();
        if (!finalData[e._id.class]) finalData[e._id.class] = {};
        if (!finalData[e._id.class][e._id.subject]) finalData[e._id.class][e._id.subject] = {};
        if (!finalData[e._id.class][e._id.subject][e._id.textbook]) finalData[e._id.class][e._id.subject][e._id.textbook] = e._id.code;
      });
      return finalData;
    });
  });
}

export async function getUniqueBranchesForValidation(context) {
  return InstituteHierarchyModel(context).then(InstituteHierarchy => InstituteHierarchy.distinct('child', { levelName: 'Branch' }));
}

function checkUniqueRowByCondition(data, temp, index) {
  const tempdata = data.slice(0, index);
  const prindex = tempdata.findIndex(x =>
    x.textbookCode === temp.textbookCode &&
    x['chapter code'] === temp['chapter code'] &&
    x.originalContentName === temp.originalContentName &&
    x['content category'] === temp['content category'] &&
    x['content type'] === temp['content type'] &&
    x.category === temp.category &&
    x.orientationString === temp.orientationString);
  return prindex;
}

function validateSheetAndGetData(req, dbData, textbookData, uniqueBranches) {
  const result = {
    success: true,
    message: '',
  };

  // validate extension
  const name = req.file.originalname.split('.');
  const extname = name[name.length - 1];
  if (extname !== 'xlsx') {
    result.success = false;
    result.message = 'Invalid extension';
    return result;
  }

  const dupmapping = {};

  const errors = [];
  // Reading  workbook
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });

  // converting the sheet data to csv
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  // deleting all trailing empty rows
  for (let i = data.length - 1; i >= 0; i -= 1) {
    let values = Object.values(data[i]);
    values = values.map(x => x.toString());
    // const vals = values.map(x => x.trim());
    if (values.every(x => x === '')) data.pop();
    else break;
  }

  // deleting empty string keys from all objects
	data.forEach((v) => { delete v['']; }); // eslint-disable-line

  // trim and remove whitespace and chaging keys to lower case
  data.forEach((obj) => {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'branches' || lowerKey === 'file path'){
         obj[lowerKey] = obj[key];
      }   
      else obj[lowerKey] = obj[key].toString().replace(/\s\s+/g, ' ').trim();
      if (key !== lowerKey) delete obj[key];
    }
  });

  const mandetoryFields = [
    'class', 'subject', 'textbook', 'chapter', 'orientation',
    'publisher', 'publish year', 'content name', 'content category',
    'file path', 'file size', 'media type',
  ];
  for (let i = 0; i < data.length; i += 1) {
    const obj = data[i];
    for (let j = 0; j < mandetoryFields.length; j += 1) {
      if (!obj[mandetoryFields[j]]) {
        result.success = false;
        result.message = `${mandetoryFields[j].toUpperCase()} not found at row ${i + 1}`;
        return result;
      }
    }
  }

  let invalidBranches = new Set();

  for (let i = 0; i < data.length; i += 1) {
    const row = i + 2;
    const obj = data[i];
    const className = obj.class;
    const subjectName = obj.subject;
    const textbookName = obj.textbook;
    const chapterName = obj.chapter;
    obj.class = obj.class.toLowerCase();
    obj.subject = obj.subject.toLowerCase();
    obj.textbook = obj.textbook.toLowerCase();
    obj.chapter = obj.chapter.toLowerCase();

    if (!dbData[obj.class]) {
      result.success = false;
      result.message = `Invalid CLASS at row ${row} (${className})`;
      // return result;
      errors.push(result.message);
      continue;
    }

    if (!dbData[obj.class][obj.subject]) {
      result.success = false;
      result.message = `Invalid SUBJECT at row ${row} (${className}->${subjectName})`;
      // return result;
      errors.push(result.message);
      continue;
    }

    const textbookCode = dbData[obj.class][obj.subject][obj.textbook];
    if (!textbookCode) {
      result.success = false;
      result.message = `Invalid TEXTBOOK at row ${row} (${subjectName}->${textbookName})`;
      // return result;
      errors.push(result.message);
      continue;
    }
    const topicData = textbookData[textbookCode] ? textbookData[textbookCode].find(x => x.name === obj.chapter) : '';
    if (!topicData) {
      result.success = false;
      result.message = `Invalid CHAPTER at row ${row} (${subjectName}->${textbookName}->${chapterName})`;
      // return result;
      errors.push(result.message);
      continue;
    }

    obj['chapter code'] = topicData.code;

    obj['file path'] = upath.toUnix(obj['file path']);

    obj.textbookCode = textbookCode;
    ['class', 'subject', 'textbook'].forEach(e => delete obj[e]);

    const categories = ['A', 'B', 'C'];
    if (obj.category && !categories.includes(obj.category)) {
      result.success = false;
      result.message = `Invalid CATEGORY at row ${row}`;
      // return result;
      errors.push(result.message);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (obj['media type']) obj['media type'] = obj['media type'].toLowerCase();

    if (obj.orientation) {
      obj.orientationString = obj.orientation;
      let values = obj.orientation.split(',');
      values = values.map(x => x.toString().replace(/\s\s+/g, ' ').trim());
      const finalOrientations = [];
      values.forEach((x) => {
        if (x) finalOrientations.push(x);
      });
      obj.orientation = finalOrientations;
    }
    if (obj.branches) {
      const branchNames = obj.branches.split(',');
      const finalBranchNames = [];
      for (let j = 0; j < branchNames.length; j += 1) {
        const branch = branchNames[j];
        // eslint-disable-next-line no-continue
        if (!branch) continue;
        // if (!uniqueBranches.includes(branch)) {
        //   invalidBranches.add(branch);
        // }
        finalBranchNames.push(branch);
      }
      obj.branches = finalBranchNames;
    }

    obj.tempunqiuecode = crypto.randomBytes(10).toString('hex');

    obj.originalContentName = obj['content name'];

    const prindex = checkUniqueRowByCondition(data, obj, i);
    if (prindex > -1) {
      const tempunqiuecode = data[prindex].tempunqiuecode;
      if (!dupmapping[tempunqiuecode]) {
        dupmapping[tempunqiuecode] = 1;
        data[prindex]['content name'] = `${obj.originalContentName} - 1`;
      }
      dupmapping[tempunqiuecode] += 1;
      obj.tempunqiuecode = tempunqiuecode;
      const seqNumber = dupmapping[tempunqiuecode];
      obj['content name'] = `${obj.originalContentName} - ${seqNumber}`;
    }
  }
  if (errors.length) {
    result.success = false;
    result.message = 'invalid data',
    result.errors = errors;
    result.isArray = true;
    return result;
  }
  invalidBranches = Array.from(invalidBranches);
  if (invalidBranches.length) {
    result.success = false;
    result.message = 'Invalid branche(s)';
    result.errors = invalidBranches;
    result.isArray = true;
    return result;
  }
  if (!data.length) {
    result.success = false;
    result.message = 'No valid data found in sheet';
    return result;
  }

  req.data = data;
  return result;
}
export async function uploadContentMapping(req, res) {
  if (!req.file) return res.status(400).end('File required');
  return Promise.all([
    getUniqueDataForValidation(req.user_cxt),
    getUniqueBranchesForValidation(req.user_cxt),
    getTextbookWiseTopicCodes(req.user_cxt),
    ContentMappingModel(req.user_cxt),
  ]).then(([dbData, uniqueBranches, textbookData, ContentMapping]) => {
    const validate = validateSheetAndGetData(req, dbData, textbookData, uniqueBranches);
    if (!validate.success) {
      const obj = { message: validate.message };
      if (validate.errors && validate.errors.length) {
        obj.count = validate.errors.length;
        obj.errors = validate.errors;
      }
      res.status(400);
      return res.send(obj);
    }
    const data = req.data;
    // return res.send({data: data.map(x => x.orientation)})
    const bulk = ContentMapping.collection.initializeUnorderedBulkOp();
    for (let i = 0; i < data.length; i += 1) {
      const temp = data[i];
      const coins = temp.coins ? temp.coins : 0;
      const obj = {
        content: {
          name: temp['content name'],
          category: temp['content category'],
          type: temp['content type'],
        },
        resource: {
          key: temp['file path'],
          size: temp['file size'],
          type: temp['media type'],
        },
        publication: {
          publisher: temp.publisher,
          year: temp['publish year'],
        },
        coins,
        orientation: temp.orientation,
        refs: {
          topic: {
            code: temp['chapter code'],
          },
          textbook: {
            code: temp.textbookCode,
          },
        },
        branches: temp.branches,
        category: temp.category,
        active: true,
      };
      const findQuery = {
        active: true,
        'refs.textbook.code': temp.textbookCode,
        'refs.topic.code': temp['chapter code'],
        'content.name': temp['content name'],
        'content.category': temp['content category'],
        'content.type': temp['content type'],
        category: temp.category,
        orientation: { $in: temp.orientation },
      };
      if(temp.branches && temp.branches.length) {
        findQuery.branches = { $size : temp.branches.length }
      }
      bulk.find(findQuery).upsert().updateOne(obj);
    }
    return bulk.execute().then(() => {
      console.info(req.file.originalname, 'Uploaded successfully....')
      return res.send('Data inserted/updated successfully')
    }).catch((err) => {
      console.error(JSON.stringify(err));
      return res.status(400).end('Error occured');
    });
  });
}

export async function getBranchNameAndCategory(context, obj) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    if (!obj) return false;
    const { hierarchy } = obj;
    if (hierarchy && hierarchy.length) {
      const branchData = hierarchy.find(x => x.level === 5);
      const project = {
        _id: 0, child: 1, childCode: 1, category: 1,
      };
      return InstituteHierarchy.findOne({ childCode: branchData.childCode }, project).cache(config.cacheTimeOut.instituteHierarchy);
    }
    return false;
  });
}

function getMongoQueryForContentMapping(args) {
  const query = { active: true };
  if (args.textbookCode) query['refs.textbook.code'] = args.textbookCode;
  if (args.topicCode) query['refs.topic.code'] = args.topicCode;
  if (args.contentCategory) query['content.category'] = { $in: args.contentCategory };
  if (args.contentType) query['content.type'] = args.contentType;
  if (args.resourceType) {
    args.resourceType = args.resourceType.map(x => x.toLowerCase());
    query['resource.type'] = { $in: args.resourceType };
  }
  if (args.orientation) query.orientation = { $in: [null, args.orientation] };
  if (args.branch) query.branches = { $in: [null, args.branch] };
  if (args.category) query.category = { $in: [null, args.category] };
  return query;
}

export async function getContentMapping(args, context) {
  if (!args.textbookCode) throw new Error('textbookCode required');
  return getStudentData(context).then((obj) => {
    if (obj && obj.orientation) args.orientation = obj.orientation;
    return getBranchNameAndCategory(context, obj).then((branchData) => {
      if (branchData) {
        if (branchData.child) args.branch = branchData.child;
        if (branchData.category) args.category = branchData.category;
      }
      const query = getMongoQueryForContentMapping(args);
      const skip = (args.pageNumber - 1) * args.limit;
      return ContentMappingModel(context).then(ContentMapping => Promise.all([
        ContentMapping.find(query).skip(skip).limit(args.limit)
          .cache(config.cacheTimeOut.contentMapping),
        ContentMapping.count(query).cache(config.cacheTimeOut.contentMapping),
      ]).then(([data, count]) => ({
        data,
        count,
      })));
    });
  });
}

export async function getContentMappingStats(args, context) {
  return Promise.all([
    SubjectModel(context),
    TextbookModel(context),
    ContentMappingModel(context),
    getStudentData(context),
  ]).then(([
    Subject,
    Textbook,
    ContentMapping,
    studentData,
  ]) => {
    const subjectQuery = { active: true };
    if (studentData) {
      const classData = studentData.hierarchy.find(x => x.level === 2);
      subjectQuery['refs.class.code'] = classData.childCode;
      if (studentData.subjects && studentData.subjects.length) {
        const codes = studentData.subjects.map(x => x.code)
        subjectQuery['$or'] = [
          { isMandatory: true },
          { code: {$in: codes} }
        ]
      }
    }
    return Subject.find(subjectQuery, {_id: 0, subject: 1, code: 1, isMandatory: 1}).cache(config.cacheTimeOut.subject).then((subjects) => {
      const subjectcodes = subjects.map(x => x.code)
      const textbookQuery = {
        active: true,
        'refs.subject.code': { $in: subjectcodes }
      }
      let studentOrientation = ''
      let studentBranch = ''

      if (studentData) {
        const { orientation, hierarchy } = studentData;
        if (orientation) {
          textbookQuery.orientations = { $in: [null, '', orientation]}
          studentOrientation = orientation
        }
        if (hierarchy && hierarchy.length) {
          const branchData = hierarchy.find(x => x.level === 5);
          if (branchData && branchData.child) {
            textbookQuery.branches = { $in: [null, '', branchData.child]}
            studentBranch = branchData.child
          }
        }
      }
      return Textbook.find(textbookQuery, { _id: 0, name: 1, code: 1, 'refs.subject.code': 1, imageUrl: 1 }).cache(config.cacheTimeOut.textbook).then((textbooks) => {
        const textbookCodes = textbooks.map(x => x.code);
        const mappingQuery = {
          active: true,
          'refs.textbook.code': { $in: textbookCodes },
        };
        if (studentOrientation) mappingQuery['orientation'] = { $in: [null, '', studentOrientation]}
        if (studentBranch) mappingQuery['branches'] = { $in: [null, '', studentBranch]}
        const aggregateQuery = [
          {
            $match: mappingQuery
          },
          {   $group: {
                  _id: {
                      textbookCode: '$refs.textbook.code',
                      topicCode: '$refs.topic.code',
                      category: '$content.category',
                      'type': '$resource.type'
                  },
                  count:
                      {
                          $sum: 1
                      }
              }
          },
          {   $group: {
                  _id: {
                      textbookCode: '$_id.textbookCode',
                      topicCode: '$_id.topicCode',
                      category: '$_id.category'
                  },
                  data:
                      {
                      $push: { type: '$_id.type', count: '$count'}
                  }
              }
          },
          {
              $project: {
                  textbookCode: '$_id.textbookCode',
                  topicCode: '$_id.topicCode',
                  category: '$_id.category',
                  data: 1
              }
          },
          {
              $project: {
                  _id: 0
              }
          }
        ]
        return ContentMapping.aggregate(aggregateQuery).allowDiskUse(true).cache(config.cacheTimeOut.contentMapping).then((data) => {
          const finalData = {}
          data.forEach((obj) => {
            const textbookCode = obj.textbookCode;
            const topicCode = obj.topicCode;
            const category = obj.category;
            if (!finalData[textbookCode]) finalData[textbookCode] = { stats: {}, next: {}}
            if (!finalData[textbookCode].stats[category]) finalData[textbookCode].stats[category] = {}

            if (!finalData[textbookCode].next[topicCode]) finalData[textbookCode].next[topicCode] = { stats: {}};
            if (!finalData[textbookCode].next[topicCode].stats[category]) finalData[textbookCode].next[topicCode].stats[category] = {}
            obj.data.forEach((assetObj) =>{
              if(!finalData[textbookCode].stats[category][assetObj.type]) finalData[textbookCode].stats[category][assetObj.type] = assetObj.count;
              else finalData[textbookCode].stats[category][assetObj.type] += assetObj.count;

              if(!finalData[textbookCode].next[topicCode].stats[category][assetObj.type]) finalData[textbookCode].next[topicCode].stats[category][assetObj.type] = assetObj.count;
              else finalData[textbookCode].next[topicCode].stats[category][assetObj.type] += assetObj.count;
            });
          })
          return finalData;
        })
      });
    });
  });
}

export async function getCMSCategoryStats(args, context) {
  let classCode = args && args.input && args.input.classCode ? args.input.classCode : null;
  const subjectCode = args && args.input && args.input.subjectCode ? args.input.subjectCode : null;
  const textbookCode = args && args.input && args.input.textbookCode ?
    args.input.textbookCode : null;
  const chapterCode = args && args.input && args.input.chapterCode ? args.input.chapterCode : null;
  const studentId = args && args.input && args.input.studentId ? args.input.studentId : null;
  let orientation = null;
  let branch = null;
  if (studentId) {
    await studentInfoModel(context).then(async (studentInfo) => {
      await studentInfo.findOne(
        { studentId },
        { hierarchy: 1, orientation: 1 },
      ).then((studentObj) => {
        const classObj = studentObj.hierarchy.find(x => x.level === 2);
        const branchObj = studentObj.hierarchy.find(x => x.level === 5);
        if (classObj && classObj.childCode) {
          classCode = classObj.classCode;
        }
        if (studentObj && studentObj.orientation) {
          orientation = studentObj.orientation;
        }
        if (branchObj && branchObj.childCode) {
          branch = branchObj.childCode;
        }
        console.info(studentId, studentObj);
      });
    });
    // classCode =
  }
  const query = {};
  const query1 = {};
  if (classCode) {
    query1['refs.class.code'] = classCode;
  } if (subjectCode) {
    query1['refs.subject.code'] = subjectCode;
  }
  const textbookCodes = [];
  if (textbookCode) {
    textbookCodes.push(textbookCode);
  }
  if (textbookCodes.length === 0) {
    if (query1) {
      await TextbookModel(context).then(async (TextBook) => {
        await TextBook.find(query1, { code: 1, _id: 0 }).then((textbookCodeObjs) => {
          if (textbookCodeObjs && textbookCodeObjs.length) {
            for (let t = 0; t < textbookCodeObjs.length; t += 1) {
              textbookCodes.push(textbookCodeObjs[t].code);
            }
          }
        });
      });
    }
  }
  if (textbookCodes.length === 0) {
    return null;
  }
  if (chapterCode) {
    query['refs.topic.code'] = chapterCode;
  } if (textbookCodes && textbookCodes.length) {
    query['refs.textbook.code'] = {
      $in: textbookCodes,
    };
  } if (orientation) {
    query.orientation = {
      $in: [orientation],
    };
  } if (branch) {
    query.branches = {
      $in: [branch, null],
    };
  }
  // console.log('query', query);
  const categoryWiseCount = [];
  await ContentMappingModel(context).then(async (ContentMappings) => {
    await ContentMappings.aggregate([
      { $match: query },
      { $project: { 'content.category': 1, _id: 0 } },
      { $group: { _id: { category: '$content.category' }, count: { $sum: 1 } } },
    ]).allowDiskUse(true).then((contentObjs) => {
      for (let c = 0; c < contentObjs.length; c += 1) {
        const tempCategory = {
          category: contentObjs[c]._id.category, //eslint-disable-line
          count: contentObjs[c].count,
        };
        categoryWiseCount.push(tempCategory);
      }
    });
  });
  return categoryWiseCount;
}

export async function getCategoryWiseFilesPaginated(args, context) {
  const classCode = args && args.input && args.input.classCode ? args.input.classCode : null;
  const subjectCode = args && args.input && args.input.subjectCode ? args.input.subjectCode : null;
  const textbookCode = args && args.input && args.input.textbookCode ?
    args.input.textbookCode : null;
  const chapterCode = args && args.input && args.input.chapterCode ? args.input.chapterCode : null;
  const pageNumber = args && args.input && args.input.pageNumber ? args.input.pageNumber : 1;
  const limit = args && args.input && args.input.limit ? args.input.limit : 0;
  const category = args && args.input && args.input.category ? args.input.category : null;
  if (!category) {
    throw new Error('Please select correct category');
  }
  const query = {};
  const query1 = {};
  if (classCode) {
    query1['refs.class.code'] = classCode;
  } if (subjectCode) {
    query1['refs.subject.code'] = subjectCode;
  }
  const textbookCodes = [];
  if (textbookCode) {
    textbookCodes.push(textbookCode);
    query1['code'] = textbookCode
  }
  let textbookCodeObj=[];
  
  await TextbookModel(context).then(async (TextBook) => {
    await TextBook.find(query1, { code: 1, _id: 0,name:1 ,
      "refs.class.name":1,"refs.subject.name":1,}).then((textbookCodeObjs) => {
      //console.log("-------------------\n",textbookCodeObjs)
      textbookCodeObj = textbookCodeObjs
      if (textbookCodeObjs && textbookCodeObjs.length) {
        for (let t = 0; t < textbookCodeObjs.length; t += 1) {
          textbookCodes.push(textbookCodeObjs[t].code);
        }
      }
    });
  });

  
  if (textbookCodes.length === 0) {
    return null;
  }

  if (chapterCode) {
    query['refs.topic.code'] = chapterCode;
  } if (textbookCodes && textbookCodes.length) {
    query['refs.textbook.code'] = {
      $in: textbookCodes,
    };
  }
  if (category) {
    query['content.category'] = category;
  }
  const skip = (pageNumber - 1) * limit;
  const categoryFiles = [];
  const finalJson = {};
  await ContentMappingModel(context).then(async ContentMappings =>
    Promise.all([
      ContentMappings.find(query, {
        content: 1, _id: 1, resource: 1, 'refs.textbook.code': 1,'refs.topic.code': 1,branches:1,
        orientation :1
      }).skip(skip).limit(limit),
      ContentMappings.find(query).skip(skip).limit(limit).count(),
      ContentMappings.count(query),
    ]).then(([contentObjs, queryCount, count]) =>{
      const tlist = contentObjs.map(x => x.refs.textbook.code)
      const topicList = contentObjs.map(x=>x.refs.topic.code)
     return ConceptTaxonomyModel(context).then((conceptTaxonomy)=>{
      return conceptTaxonomy.find({levelName:"topic",code:{
        $in:topicList}},{_id:0,code:1,child:1}).then((topicObj)=>{
      for (let c = 0; c < contentObjs.length; c += 1) {
        const tempCategory = {
          id: contentObjs[c]._id,
          content: contentObjs[c].content, //eslint-disable-line
          resource: contentObjs[c].resource,
          textbook:{
            code: contentObjs[c].refs.textbook.code,
            name :(textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).name,
          },
          className :(textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.class.name,
          subject :(textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.subject.name,
          topic:{
            code : contentObjs[c].refs.topic.code,
            name : (topicObj.find(x =>x.code ==contentObjs[c].refs.topic.code)).child
          },
          count:{
            orientation: contentObjs[c].orientation.length,
            branches: contentObjs[c].branches.length,
          },
          orientation: contentObjs[c].orientation,
          branches: contentObjs[c].branches,
        };
        categoryFiles.push(tempCategory);
      }
      const pageInfo = {
        pageNumber,
        recordsShown: queryCount,
        nextPage: limit !== 0 && limit * pageNumber < count,
        prevPage: pageNumber !== 1 && count > 0,
        totalEntries: count,
        totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
      };
      finalJson.page = categoryFiles;
      finalJson.pageInfo = pageInfo;
    })
  })
  }))
  return finalJson;

}

export async function getFileData(args, context){
  const fileExists = args && args.input && args.input.id 
  if(!fileExists){
    throw new Error("Please enter a id");
  }
  let mongoDbIdString = (args.input.id).map(value => value.toString());
  const mongoDbId = mongoDbIdString.map(value =>mongoose.Types.ObjectId(value))
  const query ={
    _id : {$in : mongoDbId}
  }
  return ContentMappingModel(context).then((contentMapping) =>{ 
    return (contentMapping.find(query)).then((contentMappingObj) =>{
      const textbookQuery = contentMappingObj.map(value => value.refs.textbook.code)
      const conceptQuery = contentMappingObj.map(value => value.refs.topic.code)
      return Promise.all([
        TextbookModel(context),
        ConceptTaxonomyModel(context)
      ]).then(([textbook,conceptTaxonomy])=>{
        return Promise.all([
          textbook.find({ code: {$in:textbookQuery}}),
          conceptTaxonomy.find({code : {$in:conceptQuery}, levelName :"topic"})
        ]).then(([
          textBookRefs,
          topicObj
        ])=>{
          const finalObj = []  
          let singleFile  = {};
          for(var i = 0 ; i < contentMappingObj.length ; i++){
              var finalObjElement = contentMappingObj[i] ;
              var tbookRefsElement = textBookRefs.find(x=>x.code === finalObjElement.refs.textbook.code);
              const topicObjElement = topicObj.find(x=>x.code === finalObjElement.refs.topic.code);
              singleFile  = {
              id: finalObjElement._id,
              content: finalObjElement && finalObjElement.content ?
                finalObjElement.content : null,
              resource: finalObjElement && finalObjElement.resource ?
                finalObjElement.resource : null,
              publication: finalObjElement && finalObjElement.publication ?
                finalObjElement.publication : null,
              orientation: finalObjElement && finalObjElement.orientation ?
                finalObjElement.orientation : null,
              refs: finalObjElement && finalObjElement.refs ?
                finalObjElement.refs : null,
              branches: finalObjElement && finalObjElement.branches ? finalObjElement.branches : null,
              class: tbookRefsElement && tbookRefsElement.refs &&
                tbookRefsElement.refs.class &&
                tbookRefsElement.refs.class.name ?
                tbookRefsElement.refs.class.name : null,
              subject:
                tbookRefsElement &&
                tbookRefsElement.refs &&
                tbookRefsElement.refs.subject &&
                tbookRefsElement.refs.subject.name ?
                tbookRefsElement.refs.subject.name : null,
              category:finalObjElement.category,
              textBookName: tbookRefsElement && tbookRefsElement.name ? tbookRefsElement.name : null,
              topicName: topicObjElement.child,
              coins: finalObjElement.coins,
              filePath: finalObjElement.resource.key,
              fileSize: finalObjElement.resource.size,
              mediaType:finalObjElement.resource.type,
            }
            finalObj[i]= singleFile
          };
          return finalObj;
        });
      });
    });
  });
};

export async function insertContent(args, context) {
  if (!args.textBookCode) {
    throw new Error('please send textBookCode');
  }
  if (!args.topicCode) {
    throw new Error('Please send topicCode');
  }
  if (!args.contentCategory) {
    throw new Error('Please send category of the content');
  }
  if (!args.fileKey) {
    throw new Error('Please send the key of the file by uploading it to AWS');
  }
  if (!args.contentName) {
    throw new Error('Please send the name of the content');
  }
  const dataToInsert = {
    content: {
      category: args && args.contentCategory ? args.contentCategory : null,
      name: args && args.contentName ? args.contentName : null,
      type: args && args.contentType ? args.contentType : null, // not mandatory
    },
    refs: {
      topic: {
        code: args && args.topicCode ? args.topicCode : null,
      },
      textbook: {
        code: args && args.textBookCode ? args.textBookCode : null,
      },
    },
    resource: {
      key: args && args.fileKey ? args.fileKey : null,
      size: args && args.fileSize ? (args.fileSize / (1024 * 1024)) : null,
      type: args && args.fileType ? args.fileType : null,
    },
    publication: {
      publisher: args && args.publisher ? args.publisher : null,
      publishedYear: args && args.publishedYear ? args.publishedYear : null,
    },
    orientation: args && args.orientation ? args.orientation : [],
    branches: args && args.branches ? args.branches : [],
    category: args && args.category ? args.category : null,
    coins: args && args.coins ? args.coins : 0,
    active: true,
    metaData: {
      audioFiles: args && args.audioFiles ? args.audioFiles : [],
    },
  };
  const whereObj = {
    category: dataToInsert.category,
    branches: dataToInsert.branches,
    'refs.topic.code': dataToInsert.refs.topic.code,
    'refs.textbook.code': dataToInsert.refs.textbook.code,
    'content.name': dataToInsert.content.name,
    'content.category': dataToInsert.content.category,
    'content.type': dataToInsert.content.type,
  };
  return ContentMappingModel(context).then(ContentMapping =>
    ContentMapping.updateOne(whereObj, { $set: dataToInsert }, { upsert: true }).then(() => 'Inserted Successfully').catch(err => err));
}
export async function getCmsTopicLevelStats(args, context) {
  let classCode = args && args.input && args.input.classCode ?
    args.input.classCode : null;
  const subjectCode = args && args.input && args.input.subjectCode ?
    args.input.subjectCode : null;
  const textbookCode = args && args.input && args.input.textbookCode ?
    args.input.textbookCode : null;
  const category = args && args.input && args.input.category ?
    args.input.category : [];
  const studentId = args && args.input && args.input.studentId ?
    args.input.studentId : null;
  console.log('studentId', studentId);
  let orientation = null;
  let branch = null;
  if (studentId) {
    await studentInfoModel(context).then(async (studentInfo) => {
      await studentInfo.findOne(
        { studentId },
        { hierarchy: 1, orientation: 1 },

      ).then((studentObj) => {
        const hierarchy = Array.from(studentObj.hierarchy);
        // console.log('studentObj.hierarchy', hierarchy);
        const classObj = hierarchy.find(x => x.level === 2);
        // console.log('classObj', classObj);
        const branchObj = hierarchy.find(x => x.level === 5);
        if (classObj && classObj.childCode) {
          classCode = classObj.childCode;
        }
        if (studentObj && studentObj.orientation) {
          orientation = studentObj.orientation;
        }
        if (branchObj && branchObj.childCode) {
          branch = branchObj.childCode;
        }
        // console.info(studentId, studentObj);
      });
    });
    // console.log('classCode', classCode);
    // classCode =
  }
  const query  = {};
  const query1 = {};
  if (!classCode) {
    throw new Error('Please select a classCode');
  }
  if (classCode) {
    query1['refs.class.code'] = classCode;
  } if (subjectCode) {
    query1['refs.subject.code'] = subjectCode;
  }
  const textbookCodes = [];
  if (textbookCode) {
    textbookCodes.push(textbookCode);
  }
  if (textbookCodes.length === 0) {
    if (query1) {
      await TextbookModel(context).then(async (Textbook) => {
        await Textbook.find(query1, { code: 1, _id: 0 }).then((textbookCodeObjs) => {
          if (textbookCodeObjs && textbookCodeObjs.length) {
            for (let t = 0; t < textbookCodeObjs.length; t += 1) {
              textbookCodes.push(textbookCodeObjs[t].code);
            }
          }
        });
      });
    }
  }
  if (textbookCodes.length === 0) {
    return null;
  }
  if (textbookCodes && textbookCodes.length) {
    query['refs.textbook.code'] = {
      $in: textbookCodes,
    };
  }
  if (category && category.length > 0) {
    query['content.category'] = {
      $in: category,
    };
  }
  if (orientation) {
    query.orientation = {
      $in: [orientation],
    };
  } if (branch) {
    query.branches = {
      $in: [branch, null],
    };
  }
  return ContentMappingModel(context).then(async ContentMappings => ContentMappings.aggregate([
    { $match: query },
    {
      $project: {
        'content.category': 1, _id: 0, refs: 1,
      },
    },
    {
      $group: {
        _id: {
          category: '$content.category', textbookCode: '$refs.textbook.code', topicCode: '$refs.topic.code',
        },
        count: { $sum: 1 },
      },
    },
  ]).allowDiskUse(true).then((contentObjs) => {
    const finalObj = {};
    for (let c = 0; c < contentObjs.length; c += 1) {
      // const tempObj = contentObjs[c];
        const tempCategory = contentObjs[c]._id.category; // eslint-disable-line
        const tempTextbookCode = contentObjs[c]._id.textbookCode; // eslint-disable-line
        const tempTopicCode = contentObjs[c]._id.topicCode; // eslint-disable-line
        const tempTopicLevelCount = contentObjs[c].count; // eslint-disable-line
      if (!finalObj[tempCategory]) {
        finalObj[tempCategory] = {};
        finalObj[tempCategory][tempTextbookCode] = {
          count: tempTopicLevelCount,
        };
        finalObj[tempCategory][tempTextbookCode].next = {};
        finalObj[tempCategory][tempTextbookCode].next[tempTopicCode] = tempTopicLevelCount;
      } else if (!finalObj[tempCategory][tempTextbookCode]) {
        finalObj[tempCategory][tempTextbookCode] = {
          count: tempTopicLevelCount,
        };
        finalObj[tempCategory][tempTextbookCode].next = {};
        finalObj[tempCategory][tempTextbookCode].next[tempTopicCode] = tempTopicLevelCount;
      } else {
        finalObj[tempCategory][tempTextbookCode].count += tempTopicLevelCount;
        finalObj[tempCategory][tempTextbookCode].next[tempTopicCode] =tempTopicLevelCount;
      }
    }
    return finalObj;
  }));
}

/* req.body should caontain filters key of the format ---
 
	"filters":{
    "category" :"A",  //compulsory input
    "textbookCode":"155695623436235d2fe4581",//optional
    "classCode" : "String", //optional
    "subjectCode" : "String",  //optional
    "topicCode" :"String" //optional but no topic code without textbookcode
  }

}*/
export async function downloadContentDetails(req, res){
  const args = req.body;
  if(!args.filters){
    throw new Error('Please input filters')
  }
  if(!args.filters.category){
    throw new Error('Please select a category')
  }
  const filters = args.filters
  return getContentDetails(req.user_cxt,filters).then((response=>{
    res.send(response)
  }))
}

async function makeJSONforCSV(filedata){
  var final = []
  for(var j =0 ; j < filedata.length ;j++){
    const singleData = filedata[j]
    const finalELe = {
      Orientation : singleData.orientation ,
      Class :singleData.class,
      Category : singleData.category,
      Branches : singleData.branches,
      Publisher :singleData.publication.publisher,
      Subject: singleData.subject,
      Textbook:singleData.textBookName,
      Chapter: singleData.topicName,
      ContentType:singleData.content.type,
      ContentCategory:singleData.content.category,
      ContentName: singleData.content.type,
      MediaType: singleData.mediaType,
      PublishYear:singleData.publication.year,
      FilePath :singleData.filePath,
      FileSize:singleData.fileSize,
      Coins:singleData.coins,
    }
    final[j] = finalELe
  }
  return final
}

export async function getContentDetails(context,filters={}){
    if(!filters.category){
      throw new Error('Select A category')
    }
    const findQuery = {
      active: true,
      category : filters.category
    }
    if(filters.textbookCode){
      findQuery['refs.textbook.code'] = filters.textbookCode
    }
    
    if(filters.topicCode && filters.textbookCode){
      findQuery['refs.topic.code'] = {$in: [null, '', filters.topicCode]}
    }
    
    return ContentMappingModel(context).then((contentMapping) => {
    if(!filters.textbookCode && (filters.subjectCode || filters.classCode)){
      const findtextbookQuery = {
        active: true
      }
      if(filters.subjectCode){
        findtextbookQuery['refs.subject.code'] = {$in: [null, '', filters.subjectCode]}
      }
      if(filters.classCode){
        findtextbookQuery['refs.class.code'] = {$in: [null, '', filters.classCode]}
      }
      return TextbookModel(context).then((textbook=>{
        return textbook.find(findtextbookQuery,{_id:0, code : 1}).then((textbookList=>{
           textbookList = textbookList.map(value => value.code)
           findQuery['refs.textbook.code'] = {$in :textbookList}
           return contentMapping.find(findQuery,{_id: 1}).then((idList)=>{
            idList = idList.map(value => value._id)
            return getFileData({input:{id:idList}},context).then((filedata)=>{
              return makeJSONforCSV(filedata);
             })
           })
        }))
      }))
    }
    return contentMapping.find(findQuery,{_id:1}).then((idList)=>{
      idList = idList.map(value => value._id)
      return getFileData({input:{id:idList}},context).then((filedata)=>{
          return makeJSONforCSV(filedata);
       });
    });
  });
}

export async function updateContent(args,context){
  if(!args || !args.input || !args.input.id){
    throw new Error('Enter the File to be edited');
  }
  if(Object.keys(args.input).length < 2){
    throw new Error('Select atleast one of the fields to edit');
  }
  let mongoDbIdString = args.input.id.toString();
  var mongoDbId;
  try{ mongoDbId = mongoose.Types.ObjectId(mongoDbIdString)}
  catch(err){
    throw new Error('Invalid ID');
  };
  var whereObj = {};
  whereObj['_id'] = mongoDbId ;
  
  var setObj = {};
  if(args && args.input ){
    if(args.input.textbookCode && args.input.topicCode){
      setObj['refs.topic.code'] = args.input.topicCode
      setObj['refs.textbook.code'] = args.input.textbookCode
    }
    if(args.input.textbookCode && !args.input.topicCode){
      throw new Error('Input topic code for corresponding textbook')
    }
    if(args.input.coins){
      setObj['coins'] = args.input.coins ;
    }
    if(args.input.contentCategory){
      setObj['content.category'] = args.input.contentCategory;
    }
    if(args.input.contentName){
      setObj['content.name'] = args.input.contentName;
    }
    if(args.input.contentType){
      setObj['content.type'] = args.input.contentType;
    }
    if(args.input.metaData){
      var metaDatakeys = Object.keys(args.input.metaData) ;
      // setObj['metaData.thumbnailKey'] = args.input.thumbnailKey
      for(var i = 0 ;i <metaDatakeys.length ;i++){
        setObj[`metaData.${metaDatakeys[i]}`] = args.input.metaData[metaDatakeys[i]] 
      }
    }
  }
  return ContentMappingModel(context).then((contentMapping)=>{
    return contentMapping.updateOne(whereObj,{ $set: setObj }).then((res,err) => {
      if (err) {
        return err;
      }
      if(res.nModified > 0) {
        return {status: 200, message: "Successfully Updated"}
      } else {
        return {status: 400, message: "No Document was found with the provided Id"}
      }
    });
  });
}

export async function updateAnimationMetaData(args, context) {
  if(!args.id) {
    throw new Error('Please send mongodb _id of the animation');
  }
  if(!args.questionpaperId) {
    throw new Error('Please send questionpaperId');
  }
  const whereObj = {
    _id: args.id,
  };
  const dataToUpdate = {
      "metaData.questionpaperId": args.questionpaperId,
  };
  return ContentMappingModel(context).then(ContentMapping =>
    ContentMapping.updateOne(whereObj, {$set: dataToUpdate }).then(() => 'Updated Successfully').catch(err => err));
}

export async function getTextbookBasedListOfQuizzes(args, context) {
  //const Quizzes = [];
  return ContentMappingModel(context).then(async ContentMapping => {
    const query = {
      "content.category": "Take Quiz",
      "refs.textbook.code": args.input.textbookCode,
    };
    const projection = {
      "quizName": "$content.name",
      "questionpaperId": "$resource.key",
    };
    return ContentMapping.aggregate([{$match: query}, {$project: projection}]).allowDiskUse(true);
  });
  
}

export default{
  updateContent
}
