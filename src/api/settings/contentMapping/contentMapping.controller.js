import { getModel as TextbookModel } from '../textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../conceptTaxonomy/concpetTaxonomy.model';
import { getModel as ContentMappingModel } from './contentMapping.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import { config } from '../../../config/environment';

const xlsx = require('xlsx');
const upath = require('upath');
const crypto = require('crypto');
const util = require('util');

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
      if (lowerKey === 'branches') obj[lowerKey] = obj[key];
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
        if (!branch) continue;
        if (!uniqueBranches.includes(branch)) {
          invalidBranches.add(branch);
        }
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
      bulk.find(findQuery).upsert().updateOne(obj);
    }
    return bulk.execute().then(() => res.send('Data inserted/updated successfully')).catch((err) => {
      console.log(JSON.stringify(err));
    });
  });
}

export async function getBranchNameAndCategory(context) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    const { rawHierarchy } = context;
    if (rawHierarchy && rawHierarchy.length) {
      const branchData = rawHierarchy.find(x => x.level === 5);
      const project = {
        _id: 0, child: 1, childCode: 1, category: 1,
      };
      return InstituteHierarchy.findOne({ childCode: branchData.childCode }, project);
    }
    return false;
  });
}

function getMongoQueryForContentMapping(args, context) {
  const query = { active: true };
  if (args.textbookCode) query['refs.textbook.code'] = args.textbookCode;
  if (args.topicCode) query['refs.topic.code'] = args.topicCode;
  if (args.contentCategory) query['content.category'] = { $in: args.contentCategory };
  if (args.contentType) query['content.type'] = args.contentType;
  if (args.resourceType) {
    args.resourceType = args.resourceType.map(x => x.toLowerCase());
    query['resource.type'] = { $in: args.resourceType };
  }
  return query;
}

export async function getContentMapping(args, context) {
  if (!args.textbookCode) throw new Error('textbookCode required');
  const query = getMongoQueryForContentMapping(args, context);
  return getBranchNameAndCategory(context).then(() => {
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
}

export async function getCMSCategoryStats(args, context) {
  const classCode = args && args.input && args.input.classCode ? args.input.classCode : null;
  const subjectCode = args && args.input && args.input.subjectCode ? args.input.subjectCode : null;
  const textBookCode = args && args.input && args.input.textBookCode ?
    args.input.textBookCode : null;
  const chapterCode = args && args.input && args.input.chapterCode ? args.input.chapterCode : null;
  const query = {};
  const query1 = {};
  if (classCode) {
    query1['refs.class.code'] = classCode;
  } if (subjectCode) {
    query1['refs.subject.code'] = subjectCode;
  }
  const textBookCodes = [];
  if (textBookCode) {
    textBookCodes.push(textBookCode);
  }
  if (textBookCodes.length === 0) {
    if (query1) {
      await TextbookModel(context).then(async (TextBook) => {
        await TextBook.find(query1, { code: 1, _id: 0 }).then((textBookCodeObjs) => {
          if (textBookCodeObjs && textBookCodeObjs.length) {
            for (let t = 0; t < textBookCodeObjs.length; t += 1) {
              textBookCodes.push(textBookCodeObjs[t].code);
              // console.log('textBookCodes', textBookCodes);
            }
          }
        });
      });
    }
  }
  if (textBookCodes.length === 0) {
    return null;
  }
  if (chapterCode) {
    query['refs.topic.code'] = chapterCode;
  } if (textBookCodes && textBookCodes.length) {
    query['refs.textbook.code'] = {
      $in: textBookCodes,
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
  const textBookCode = args && args.input && args.input.textBookCode ?
    args.input.textBookCode : null;
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
  const textBookCodes = [];
  if (textBookCode) {
    textBookCodes.push(textBookCode);
  }
  if (textBookCodes.length === 0) {
    if (query1) {
      await TextbookModel(context).then(async (TextBook) => {
        await TextBook.find(query1, { code: 1, _id: 0 }).then((textBookCodeObjs) => {
          if (textBookCodeObjs && textBookCodeObjs.length) {
            for (let t = 0; t < textBookCodeObjs.length; t += 1) {
              textBookCodes.push(textBookCodeObjs[t].code);
              // console.log('textBookCodes', textBookCodes);
            }
          }
        });
      });
    }
  }
  if (textBookCodes.length === 0) {
    return null;
  }
  if (chapterCode) {
    query['refs.topic.code'] = chapterCode;
  } if (textBookCodes && textBookCodes.length) {
    query['refs.textbook.code'] = {
      $in: textBookCodes,
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
      ContentMappings.find(query, { 'content.category': 1, _id: 0, 'resource.key': 1 }).skip(skip).limit(limit),
      ContentMappings.find(query).skip(skip).limit(limit).count(),
      ContentMappings.count(query),
    ]).then(([contentObjs, queryCount, count]) => {
      for (let c = 0; c < contentObjs.length; c += 1) {
        const tempCategory = {
          category: contentObjs[c].content.category, //eslint-disable-line
          resource: contentObjs[c].resource.key,
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
    }));
  return finalJson;
}

export async function getFileData(args, context) {
  const fileKey = args && args.input && args.input.fileKey ?
    args.input.fileKey : null;
  const textBookCode = args && args.input && args.input.textBookCode ?
    args.input.textBookCode : null;
  const query = {};
  const query1 = {};
  if (!fileKey) {
    throw new Error('Please select a fileKey');
  }
  query['resource.key'] = fileKey;
  if (!textBookCode) {
    throw new Error('Please provide textBookCode');
  }
  query['refs.textbook.code'] = textBookCode;
  query1.code = textBookCode;
  return Promise.all([TextbookModel(context), ContentMappingModel(context)])
    .then(([TextBook, ContentMapping]) => Promise.all([TextBook.findOne(query1, {
      code: 1, 'refs.class.name': 1, 'refs.subject.name': 1, name: 1,
    }), ContentMapping.findOne(query)]).then(async ([textBookRefs, contentMappingObjs]) =>
      // const topicName = null;
      ConceptTaxonomyModel(context).then(ConceptTaxonomy => ConceptTaxonomy.findOne(
        {
          code: contentMappingObjs.refs.topic.code,
          'refs.textbook.code': contentMappingObjs.refs.textbook.code,
        },
        { child: 1 },
      ).then((topicObj) => {
        const finalObj = {
          content: contentMappingObjs && contentMappingObjs.content ?
            contentMappingObjs.content : null,
          resource: contentMappingObjs && contentMappingObjs.resource ?
            contentMappingObjs.resource : null,
          publication: contentMappingObjs && contentMappingObjs.publication ?
            contentMappingObjs.publication : null,
          orientation: contentMappingObjs && contentMappingObjs.orientation ?
            contentMappingObjs.orientation : null,
          refs: contentMappingObjs && contentMappingObjs.refs ?
            contentMappingObjs.refs : null,
          branches: contentMappingObjs && contentMappingObjs.branches ?
            contentMappingObjs.branches : null,
          class: textBookRefs &&
          textBookRefs.refs &&
          textBookRefs.refs.class &&
          textBookRefs.refs.class.name ?
            textBookRefs.refs.class.name : null,
          subject: textBookRefs &&
          textBookRefs.refs &&
          textBookRefs.refs.subject &&
          textBookRefs.refs.subject.name ?
            textBookRefs.refs.subject.name : null,
          category: contentMappingObjs.category,
          textBookName: textBookRefs && textBookRefs.name ? textBookRefs.name : null,
          topicName: topicObj.child,
        };
        return finalObj;
      }))));
}

export async function getCmsTopicLevelStats(args, context) {
  const classCode = args && args.input && args.input.classCode ?
    args.input.classCode : null;
  const subjectCode = args && args.input && args.input.subjectCode ?
    args.input.subjectCode : null;
  const textbookCode = args && args.input && args.input.textbookCode ?
    args.input.textbookCode : null;
  const category = args && args.input && args.input.category ?
    args.input.category : [];
  const query = {};
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
        finalObj[tempCategory][tempTextbookCode].next[tempTopicCode] =
              tempTopicLevelCount;
      }
    }
    return finalObj;
  }));
}
