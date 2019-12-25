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
const _ = require('lodash');

const mongoose = require('mongoose');
const uniq = require('lodash/uniq');

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
  return InstituteHierarchyModel(context).then(InstituteHierarchy => InstituteHierarchy.distinct('child', { active: true, levelName: 'Branch' }));
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
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{defval:""});

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
    'class', 'subject', 'textbook', 'chapter',
    'content name', 'content category',
    'file path', 'media type',
    'view order'
  ];
  const headers  = [
    'class', 'subject', 'textbook', 'chapter',
    'content name', 'content category', 'content type',
    'file path', 'file size', 'media type',
    'timg path', 'coins', 'view order',
    'category', 'publish year', 'publisher',
  ]
  if(!data.length) {
    result.success = false;
    result.message = 'Data not found in sheet'
    return result;
  }
  const sheetHeaders = Object.keys(data[0])
  let diffHeaders = _.difference(headers,sheetHeaders);
  if(diffHeaders.length) {
    result.success = false;
    result.message = `${diffHeaders.toString()} headers not found`
    return result;
  }

  for(let i = 0; i < data.length; i += 1){
    const obj = data[i];
    for (let j = 0; j < mandetoryFields.length; j += 1) {
      if (!obj[mandetoryFields[j]]) {
        result.success = false;
        result.message = `${mandetoryFields[j].toUpperCase()} value not found for row ${i + 2}`;
        return result;
      }
    }
  }


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
      errors.push(result.message);
      continue;
    }

    if (!dbData[obj.class][obj.subject]) {
      result.success = false;
      result.message = `Invalid SUBJECT at row ${row} (${className}->${subjectName})`;
      errors.push(result.message);
      continue;
    }

    const textbookCode = dbData[obj.class][obj.subject][obj.textbook];
    if (!textbookCode) {
      result.success = false;
      result.message = `Invalid TEXTBOOK at row ${row} (${subjectName}->${textbookName})`;
      errors.push(result.message);
      continue;
    }

    const topicData = textbookData[textbookCode] ? textbookData[textbookCode].find(x => x.name === obj.chapter) : '';
    if (!topicData) {
      result.success = false;
      result.message = `Invalid CHAPTER at row ${row} (${subjectName}->${textbookName}->${chapterName})`;
      errors.push(result.message);
      continue;
    }
    obj['chapter code'] = topicData.code;

    obj['file path'] = upath.toUnix(obj['file path']);
    if(obj['timg path']) obj['timg path'] = upath.toUnix(obj['timg path']);

    obj.textbookCode = textbookCode;
    ['class', 'subject', 'textbook'].forEach(e => delete obj[e]);

    const categories = ['A', 'B', 'C'];
    if (obj.category && !categories.includes(obj.category)) {
      result.success = false;
      result.message = `Invalid CATEGORY at row ${row}`;
      errors.push(result.message);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (obj['media type']) obj['media type'] = obj['media type'].toLowerCase();
    const viewOrder = parseInt(obj['view order']);
    if (!Number.isInteger(viewOrder) || viewOrder < 1) {
      result.success = false;
      result.message = `Invalid view order at row ${row}`;
    }
    obj['view order'] = viewOrder;
    
    if(obj['coins']) {
      const coins = parseInt(obj['coins']);
      if (!Number.isInteger(coins) || coins < 0) {
        result.success = false;
        result.message = `Invalid coins at row ${row}`;
      }
      obj['coins'] = coins
    }
   
    // obj.tempunqiuecode = crypto.randomBytes(10).toString('hex');

    // obj.originalContentName = obj['content name'];

    // const prindex = checkUniqueRowByCondition(data, obj, i);
    // if (prindex > -1) {
    //   const tempunqiuecode = data[prindex].tempunqiuecode;
    //   if (!dupmapping[tempunqiuecode]) {
    //     dupmapping[tempunqiuecode] = 1;
    //     data[prindex]['content name'] = `${obj.originalContentName} - 1`;
    //   }
    //   dupmapping[tempunqiuecode] += 1;
    //   obj.tempunqiuecode = tempunqiuecode;
    //   const seqNumber = dupmapping[tempunqiuecode];
    //   obj['content name'] = `${obj.originalContentName} - ${seqNumber}`;
    // }
  }
  if (errors.length) {
    result.success = false;
    result.message = 'invalid data',
    result.errors = errors;
    result.isArray = true;
    return result;
  }

  req.data = data;
  return result;
}

function getCleanFileData(req){
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

export async function getDbDataForValidation(context) {
  const [
    InstituteHierarchy,
    Subject,
    Textbook,
    ConceptTaxonomy,
  ] = await Promise.all([
    InstituteHierarchyModel(context),
    SubjectModel(context),
    TextbookModel(context),
    ConceptTaxonomyModel(context),
  ]).catch( err => {
    console.error(err);
  })
  const [
    classData,
    subjectData,
    textbookData,
    chaptersData,
  ] = await Promise.all([
    InstituteHierarchy.aggregate([{$match: { active: true, levelName: 'Class'}},{$project: { name: { $toLower: '$child' }, code: '$childCode',_id: 0 }}]),
    Subject.aggregate([{$match: { active: true, 'refs.class.code': {$exists: true }}},{$project: { name: { $toLower: '$subject' }, code: '$code',_id: 0, refs: 1 }}]),
    Textbook.aggregate([{$match: { active: true, 'refs.subject.code': { $exists: true }}},{$project: { name: { $toLower: '$name' }, code: '$code',_id: 0, refs: 1 }}]),
    ConceptTaxonomy.aggregate([
      { $match: { active: true, levelName: 'topic' }},
      { $group: { _id: '$refs.textbook.code', chapters: { $push: { name: { $toLower: '$child' }, code: '$code' }}}}, 
    ]),
  ]).catch(err => {
    console.error(err)
  })
  const dbData = {};
  classData.forEach( classObj => {
    dbData[classObj.name] = {};
    subjectData.filter(x => x.refs.class.code === classObj.code).forEach( subjectObj => {
      dbData[classObj.name][subjectObj.name] = {}
      textbookData.filter( x => x.refs.subject.code === subjectObj.code).forEach( textbookObj => {
        dbData[classObj.name][subjectObj.name][textbookObj.name] = {}
        const textbookChapters = chaptersData.find( x => x._id === textbookObj.code);
        if(textbookChapters) {
          textbookChapters.chapters.forEach(chapterObj => {
            dbData[classObj.name][subjectObj.name][textbookObj.name][chapterObj.name] = {
              topicCode: chapterObj.code,
              textbookCode: textbookObj.code,
            }
          })
        }
      })
    })
  })
 return dbData;
}

function validateHeaders(data, errors, maxLimit) {
  const mandetoryFields = [
    'class', 'subject', 'textbook', 'chapter',
    'content name', 'content category',
    'file path', 'media type',
    'view order'
  ];
  const headers  = [
    'class', 'subject', 'textbook', 'chapter',
    'content name', 'content category', 'content type',
    'file path', 'file size', 'media type',
    'timg path', 'coins', 'view order',
    'category', 'publish year', 'publisher',
  ]
  const sheetHeaders = Object.keys(data[0]);
  let diffHeaders = _.difference(headers,sheetHeaders);

  if(diffHeaders.length) {
    errors.push(`${diffHeaders.toString()} headers not found`);
    return errors;
  }

  for(let i = 0; i < data.length; i += 1){
    const obj = data[i];
    for (let j = 0; j < mandetoryFields.length; j += 1) {
      if (!obj[mandetoryFields[j]]) {
        errors.push(`${mandetoryFields[j].toUpperCase()} value not found for row ${i + 2}`);
        if(errors.length > maxLimit) return errors;
      }
    }
  }
  return errors;
}
export async function uploadContentMappingv2(req, res) {
  if (!req.file) return res.status(400).end('File required');
  	// validate extension
	const name = req.file.originalname.split('.');
	const extname = name[name.length - 1];
	if (extname !== 'xlsx') {
	  return res.status(400).end('Invalid extension, please upload .xlsx file');
	}
  let data = getCleanFileData(req);
  if(!data.length) {
    return res.status(400).end('No data found');
  }
  if(data.length > 10000) {
    return res.status(400).end('Limit exceeded, max rows 10k');
  }
  let errors = [];
  const maxLimit = 1000;
  errors = validateHeaders(data, errors, maxLimit);
  
  if(errors.length) {
    return res.send({
      success: false,
      message: 'Invalid data',
      errors,
    })
  }
  const dbData = await getDbDataForValidation(req.user_cxt)
  const ContentMapping = await ContentMappingModel(req.user_cxt);
  const bulk = ContentMapping.collection.initializeUnorderedBulkOp();
  const validContentCategories = [ 
    'Reading Material',
    'Activity',
    'Animation',
    'Slide Show',
    'Games',
    'Audio' ]
  const contentTypes = config.CONTENT_TYPES || {};

  for(let i=0; i < data.length; i+=1) {
    if(errors.length > maxLimit) {
      return res.send({
        success: false,
        message: 'Invalid data',
        errors,
      })
    }

    const row = i+2;
    const obj = data[i];


    // VALIDATING CONTENT CATEGORY
    const contentCategory = validContentCategories.find(x => x.toLowerCase() === obj['content category'].toLowerCase());
    if(!contentCategory) {
      errors.push(`Invalid CONTENT CATEGORY at row ${row} (${obj['content category']})`);
    }

    // VALIDATING CONTENT MEDIA TYPE
    if( contentTypes && 
        contentTypes[contentCategory] && 
        !contentTypes[contentCategory].includes(obj['media type'].toLowerCase())
      ) {
      errors.push(`Invalid MEDIA TYPE at row ${row} (${obj['media type']}) for CONTENT CATEGORY (${obj['content category']})`);
    }

    // VALIDATING CATEGORY
    const categories = ['A', 'B', 'C'];
    if (obj.category && !categories.includes(obj.category)) {
      errors.push(`Invalid CATEGORY at row ${row} (${obj.category})`);
    }
    
    // VALIDATING COINS
    const coins = parseInt(obj['coins']);
    if(obj['coins']) {
      if (!Number.isInteger(coins) || coins < 0) {
        errors.push(`Invalid coins at row ${row} (${obj['coins']})`);
      }
    }

    // VALIDATING VIEW ORDER
    const viewOrder = parseInt(obj['view order']);
    if (!Number.isInteger(viewOrder) || viewOrder < 1) {
      errors.push(`Invalid view order at row ${row}`);
    }

    const className = obj.class.toLowerCase();
    const subjectName = obj.subject.toLowerCase();
    const textbookName = obj.textbook.toLowerCase();
    const chapterName = obj.chapter.toLowerCase();
    
    // VALIDATING CLASS
    if(!dbData[className]) {
      errors.push(`Invalid CLASS at row ${row} (${obj.class})`);
      continue;
    }

    // VALIDATING SUBJECT
    if(!dbData[className][subjectName]) {
      errors.push(`Invalid SUBJECT at row ${row} (${obj.class}->${obj.subject})`);
      continue;
    }

    // VALIDATING TEXTBOOK
    if(!dbData[className][subjectName][textbookName]) {
      errors.push(`Invalid TEXTBOOK at row ${row} (${obj.class}->${obj.subject}->${obj.textbook})`);
      continue;
    }
    
    // VALIDATING CHAPTER
    const chapterObj = dbData[className][subjectName][textbookName][chapterName];
    if(!chapterObj) {
      errors.push(`Invalid CHAPTER at row ${row} (${obj.class}->${obj.subject}->${obj.textbook}->${obj.chapter})`);
      continue;
    }

    if(errors.length) continue;

    // PREPARING DATA OBJECT
    const temp = {
      content: {
        name: obj['content name'],
        category: contentCategory,
        type: obj['content type'],
      },
      resource: {
        key: upath.toUnix(obj['file path']),
        size: obj['file size'],
        type: obj['media type'].toLowerCase(),
      },
      publication: {
        publisher: obj.publisher,
        year: obj['publish year'],
      },
      timgPath: obj['timg path'] ? upath.toUnix(obj['timg path']) : '',
      category: obj.category,
      coins: coins ? coins : 0,
      viewOrder: viewOrder,
      refs: {
        topic: {
          code: chapterObj.topicCode,
        },
        textbook : {
          code: chapterObj.textbookCode,
        },
      },
      active: true,
    };
    if(obj['asset id']) {
      temp.assetId = obj['asset id'];
      const findQuery = {
        assetId: temp.assetId,
      }
      bulk.find(findQuery).updateOne(temp)
    } else {
      temp.assetId = crypto.randomBytes(10).toString('hex');
      const findQuery = {
        active: true,
        'refs.textbook.code': chapterObj.textbookCode,
        'refs.topic.code': chapterObj.topicCode,
        'content.name': temp.content.name,
        'content.category': temp.content.category,
        'content.type': temp.content.type,
        'resource.key': temp.resource.key,
      };
      bulk.find(findQuery).upsert().updateOne(temp);
    }
  }

if(errors.length) {
  console.info('sending errors..')
  return res.send({
    success: false,
    message: 'Invalid data',
    errors,
  })
}
console.info('bulk executing..')
  return bulk.execute().then(() => {
    console.info(req.file.originalname, 'Uploaded successfully....')
    return res.send('Data inserted/updated successfully')
  }).catch((err) => {
    console.error(err);
    return res.status(400).end('Error occured');
  });
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
        timgPath: temp['timg path'],
        viewOrder: temp['view order'],
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
        'resource.key': temp['file path']
      };
      bulk.find(findQuery).upsert().updateOne(obj)
    }
    console.log('trying to insert..')
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
      return InstituteHierarchy.findOne({ childCode: branchData.childCode }, project);
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
        ContentMapping.find(query).sort({viewOrder: 1}).skip(skip).limit(args.limit),
        ContentMapping.count(query),
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
    return Subject.find(subjectQuery, {_id: 0, subject: 1, code: 1, isMandatory: 1}).then((subjects) => {
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
      return Textbook.find(textbookQuery, { _id: 0, name: 1, code: 1, 'refs.subject.code': 1, imageUrl: 1 }).then((textbooks) => {
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
        return ContentMapping.aggregate(aggregateQuery).allowDiskUse(true).then((data) => {
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

export async function getDashboardHeadersAssetCount(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
    contentCategory,
    header
  } = args;
  let groupby = 'class';
  if (header === 'subject') groupby = header;
  const textbookQuery = { active: true }
  if (classCode ) textbookQuery['refs.class.code'] = classCode;
  if (subjectCode) textbookQuery['refs.subject.code'] = subjectCode;
  if (textbookCode) textbookQuery['code'] = textbookCode;
  if (branch) textbookQuery['branches'] = { $in: [ branch, null ] };
  if (orientation) textbookQuery['orientations'] = { $in: [ orientation, null ] };
  const textbookMatchQuery = { $match: textbookQuery }
  const textbookGroupQuery = {
    $group: {
      _id: `$refs.${groupby}.code`,
      textbookCodes: { $push: '$code' }
    }
  }
  return TextbookModel(context).then((Textbook) => {
    return Textbook.aggregate([textbookMatchQuery, textbookGroupQuery]).allowDiskUse(true).then((docs) => {
      if(!docs || !docs.length) return {};
      let textbookCodes = []
      docs.forEach(x => {
        textbookCodes = textbookCodes.concat(x.textbookCodes)
      })
      groupby = 'refs.textbook.code';
      if (header === 'chapter' ) groupby = 'refs.topic.code';
      if (header === 'branch' ) groupby = 'branches';
      if (header === 'orientation') groupby = 'orientation';
      const contentQuery = {
        active: true,
        'refs.textbook.code': { $in: textbookCodes },
      };
      if (chapterCode) contentQuery['refs.topic.code'] = chapterCode;
      if (contentCategory) contentQuery['content.category'] = contentCategory;
      else contentQuery['content.category'] = { $nin: ['Take Quiz', 'Tests']}
      if (branch) contentQuery['branches'] = branch;
      if (orientation) contentQuery['orientation'] = orientation;
      const aggregateQuery = [];
      const contentMatchQuery = {
        $match: contentQuery,
      }
      aggregateQuery.push(contentMatchQuery);
      if(header === 'branch') {
        aggregateQuery.push({$unwind: '$branches'});
      }
      if(header === 'orientation') {
        aggregateQuery.push({$unwind: '$orientation'});
      }
      const contentGroupQuery = {
        $group: {
          _id: `$${groupby}`,
          count: { $sum: 1 },
        }
      }
      aggregateQuery.push(contentGroupQuery)
      return ContentMappingModel(context).then((ContentMapping) => {
        return ContentMapping.aggregate(aggregateQuery).allowDiskUse(true).then((result) => {
          const finaldata = {}
          if( header === 'subject' || header === 'class' || !header) {
            docs.forEach(x => {
              // console.log(x._id);
               finaldata[x._id] = 0;
               x.textbookCodes.forEach(y => {
                  const tempbook = result.find(z => z._id === y);
                  if(tempbook){
                    finaldata[x._id] += tempbook.count;
                  }
              })
            })
          } else {
            result.forEach(x => {
              finaldata[x._id] = x.count;
            })
          }
          return finaldata;
        })
      })
    })
  })
}


function getContentTypeMatchOrData(contentCategory){
  const orData = [];
  let contentTypes = config.CONTENT_TYPES || {};
  if(contentCategory) {
    if(contentTypes[contentCategory]){
      orData.push({'content.category': contentCategory, 'resource.type': { $in: contentTypes[contentCategory]}});
    } else {
      orData.push({'content.category': contentCategory });
    }
    return orData;
  }
  for(let category in contentTypes){
    orData.push({'content.category': category, 'resource.type': { $in: contentTypes[category]}});
  }
  return orData;
}

export async function getDashboardHeadersAssetCountV2(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
    contentCategory,
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

  const [ Textbook, ContentMapping ] = await Promise.all([TextbookModel(context), ContentMappingModel(context)]);
  const docs = await Textbook.aggregate(textbookAggregateQuery).allowDiskUse(true);

  if(!docs || !docs.length) return {};

  let textbookCodes = []
  docs.forEach(x => {
    textbookCodes = textbookCodes.concat(x.textbookCodes)
  })

  textbookCodes = Array.from(new Set(textbookCodes));

  const contentQuery = { 
    active: true,
    'refs.textbook.code': { $in: textbookCodes },
  };
  const contentTypeMatchOrData = getContentTypeMatchOrData(contentCategory);
  if(contentTypeMatchOrData.length) contentQuery['$or'] = contentTypeMatchOrData;
  
  if (chapterCode) contentQuery['refs.topic.code'] = chapterCode;
  const aggregateQuery = []; 
  const contentMatchQuery = {
    $match: contentQuery,
  }
  groupby = 'refs.textbook.code';
  if(header === 'chapter') groupby = 'refs.topic.code';
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

export async function getCMSCategoryStats(args, context) {
  let classCode = args && args.input && args.input.classCode ? args.input.classCode : null;
  const subjectCode = args && args.input && args.input.subjectCode ? args.input.subjectCode : null;
  const textbookCode = args && args.input && args.input.textbookCode ?
    args.input.textbookCode : null;
  const chapterCode = args && args.input && args.input.chapterCode ? args.input.chapterCode : null;
  const studentId = args && args.input && args.input.studentId ? args.input.studentId : null;
  let orientation = args && args.input && args.input.orientation || null;
  let branch = args && args.input && args.input.branch || null;
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
  } if (orientation) {
    query1.orientation = {
      $in: [orientation, null],
    };
  } if (branch) {
    query1.branches = {
      $in: [branch, null],
    };
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
  }
  // if (orientation) {
  //   query.orientation = {
  //     $in: [orientation, null],
  //   };
  // } if (branch) {
  //   query.branches = {
  //     $in: [branch, null],
  //   };
  // }
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

export async function getCMSCategoryStatsV2(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
  } = args;

  // Textbook data;
  const textbookMatchQuery = { active: true }
  if (classCode ) textbookMatchQuery['refs.class.code'] = classCode;
  if (subjectCode) textbookMatchQuery['refs.subject.code'] = subjectCode;
  if (textbookCode) textbookMatchQuery['code'] = textbookCode;
  if (branch) textbookMatchQuery['branches'] = { $in: [ branch, null ] };
  if (orientation) textbookMatchQuery['orientations'] = { $in: [ orientation, null ] };


  const [ Textbook, ContentMapping ] = await Promise.all([TextbookModel(context), ContentMappingModel(context)]);
  const docs = await Textbook.find(textbookMatchQuery,{_id: 0, code: 1, 'refs.class.code': 1 })
  if(!docs || !docs.length) return [];
  // return docs;
  const objectifyDocs = {};
  docs.forEach(x => objectifyDocs[x.code] = x.refs.class.code);
  let textbookCodes = docs.map(x => x.code);

  // Content mapping
  const contentAggregateQuery = [];
  const contentMatchQuery = { active: true }
  const contentTypeMatchOrData = getContentTypeMatchOrData("");
  if(contentTypeMatchOrData.length) contentMatchQuery['$or'] = contentTypeMatchOrData;
  contentMatchQuery['refs.textbook.code'] = { $in: textbookCodes };
  if(chapterCode) contentMatchQuery['refs.topic.code'] = chapterCode;
  contentAggregateQuery.push({$match: contentMatchQuery});
  // return contentMatchQuery;
  const contentGroupQuery = {
    _id: {
      textbookCode: '$refs.textbook.code',
      category: '$content.category'
    }, count: { $sum: 1 }
  }
  contentAggregateQuery.push({$group: contentGroupQuery });
  const data = await ContentMapping.aggregate(contentAggregateQuery).allowDiskUse(true);
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
    for(let category in tempData[temp]){
      finalData.push({classCode: temp, category, count: tempData[temp][category]})
    }
  }
  return finalData;
}

export async function getCategoryWiseFilesPaginatedV2(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
    category,
    gaStatus
  } = args;
  const pageNumber = args.pageNumber || 1;
  const limit = args.limit || 0;
  
  const textbookMatchQuery = { active: true }
  if (classCode ) textbookMatchQuery['refs.class.code'] = classCode;
  if (subjectCode) textbookMatchQuery['refs.subject.code'] = subjectCode;
  if (textbookCode) textbookMatchQuery['code'] = textbookCode;
  if (branch) textbookMatchQuery['branches'] = { $in: [ branch, null ] };
  if (orientation) textbookMatchQuery['orientations'] = { $in: [ orientation, null ] };

  const [ Textbook, ContentMapping, ConceptTaxonomy ] = await Promise.all([TextbookModel(context), ContentMappingModel(context), ConceptTaxonomyModel(context)]);
  const textbooks = await Textbook.find(textbookMatchQuery);
  const textbooksObj = {}
  textbooks.forEach(x => textbooksObj[x.code] = x);
  const textbookCodes = textbooks.map(x => x.code);
  
  if (!textbookCodes.length) return null;
  const topicAggregateQuery = [];
  const topicMatchQuery = {
    active: true,
    levelName: 'topic',
    'refs.textbook.code': { $in: textbookCodes },
  }
  if (chapterCode) topicMatchQuery['code'] = chapterCode;
  topicAggregateQuery.push({$match: topicMatchQuery});
  const topicGroupQuery = {
    _id: {
      textbookCode: '$refs.textbook.code',
      topicCode: '$code',
      name: '$child'
    }
  }
  topicAggregateQuery.push({$group: topicGroupQuery });
  const topics = await ConceptTaxonomy.aggregate(topicAggregateQuery).allowDiskUse(true);
  const topicsObj = {};
  topics.forEach(x => {
    if(!topicsObj[x._id.textbookCode]) topicsObj[x._id.textbookCode] = {};
    topicsObj[x._id.textbookCode][x._id.topicCode] = x._id.name;
  })

  if (!topics.length) return null;
  
  const contentQuery = {
    active: true,
    'refs.textbook.code': { $in: textbookCodes },
  }
  const contentTypeMatchOrData = getContentTypeMatchOrData(category);
  contentQuery['$or'] = contentTypeMatchOrData;
  if (chapterCode) contentQuery['refs.topic.code'] = chapterCode;
  if (category === 'Practice' && gaStatus) contentQuery.gaStatus = gaStatus;
  const skip = (pageNumber - 1) * limit;
  const [assets, count] = await Promise.all([
    ContentMapping.find(contentQuery).skip(skip).limit(limit),
    ContentMapping.countDocuments(contentQuery)
  ]);
  const finalData = [];
  assets.forEach(obj => {
    const textbook = textbooksObj[obj.refs.textbook.code];
    const topicName = topicsObj[obj.refs.textbook.code][obj.refs.topic.code];
    const temp = {
      id: obj._id,
      content: obj.content, //eslint-disable-line
      resource: obj.resource,
      textbook:{
        code: obj.refs.textbook.code,
        name: textbook.name,
      },
      className: textbook.refs.class.name,
      subject: textbook.refs.subject.name,
      topic:{
        code : obj.refs.topic.code,
        name : topicName,
      },
      count:{
        orientation: textbook.orientations ? textbook.orientations.length : 0,
        branches: textbook.branches ? textbook.branches.length : 0,
      },
      orientation: textbook.orientations,
      branches: textbook.branches,
    };
    finalData.push(temp);
  })
  const finalJson = {}
  const pageInfo = {
    pageNumber,
    recordsShown: assets.count,
    nextPage: limit !== 0 && limit * pageNumber < count,
    prevPage: pageNumber !== 1 && count > 0,
    totalEntries: count,
    totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
  };
  finalJson.page = finalData;
  finalJson.pageInfo = pageInfo;
  return finalJson;
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
  if (textbookCode) {
    if (!subjectCode) {
      throw new Error('Please select Subject before selecting textbook');
    }
  }
  if (chapterCode) {
    if (!textbookCode) {
      throw new Error('Please select textbook before selecting chapter');
    }
  }
  let orientation = args && args.input && args.input.orientation || null;
  let branch = args && args.input && args.input.branch || null;
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
  let textbookCodes = [];
  if (textbookCode) {
    if(!textbookCodes.includes(textbookCode)) {
      textbookCodes.push(textbookCode);
    }
    query1['code'] = textbookCode
  }

  if (orientation) {
    query1.orientation = {
      $in: [orientation, null],
    };
  } if (branch) {
    query1.branches = {
      $in: [branch, null],
    };
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
    textbookCodes = uniq(textbookCodes);
    query['refs.textbook.code'] = {
      $in: textbookCodes,
    };
  }
  if (category) {
    query['content.category'] = category;
    query['resource.type'] = {
      $in: config.CONTENT_TYPES[category]
    }
  }
  const skip = (pageNumber - 1) * limit;
  const categoryFiles = [];
  const finalJson = {};
  // console.log("query", query);
  await ContentMappingModel(context).then(async ContentMappings =>
    Promise.all([
      ContentMappings.find(query, {
        content: 1, _id: 1, resource: 1, 'refs.textbook.code': 1,'refs.topic.code': 1,branches:1,
        orientation :1
      }).skip(skip).limit(limit),
      ContentMappings.find(query).skip(skip).limit(limit).countDocuments(),
      ContentMappings.countDocuments(query),
    ]).then(([contentObjs, queryCount, count]) =>{
      const tlist = contentObjs.map(x => x.refs.textbook.code)
      const topicList = contentObjs.map(x=>x.refs.topic.code)
     return ConceptTaxonomyModel(context).then((conceptTaxonomy)=>{
      return conceptTaxonomy.find({levelName:"topic",code:{
        $in:topicList}},{_id:0,code:1,child:1}).then((topicObj)=>{
      for (let c = 0; c < contentObjs.length; c += 1) {
        const className = textbookCodeObj &&
          textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code) &&
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs &&
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.class &&
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.class.name ?
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.class.name : null;
        const subject = textbookCodeObj &&
          textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code) &&
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs &&
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.subject &&
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.subject.name ?
          (textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).refs.subject.name : null;
        const tempCategory = {
          id: contentObjs[c]._id,
          content: contentObjs[c].content, //eslint-disable-line
          resource: contentObjs[c].resource,
          textbook:{
            code: contentObjs[c].refs.textbook.code,
            name :(textbookCodeObj.find(x =>x.code ==contentObjs[c].refs.textbook.code)).name,
          },
          className,
          subject,
          topic:{
            code : contentObjs && contentObjs[c] && contentObjs[c].refs && contentObjs[c].refs.topic && contentObjs[c].refs.topic.code ? contentObjs[c].refs.topic.code : null,
            name : topicObj && topicObj.find(x =>x.code ==contentObjs[c].refs.topic.code) && (topicObj.find(x =>x.code ==contentObjs[c].refs.topic.code)).child ? (topicObj.find(x =>x.code ==contentObjs[c].refs.topic.code)).child : null
          },
          count:{
            orientation: contentObjs && contentObjs[c] && contentObjs[c].orientation ? contentObjs[c].orientation.length : 0,
            branches:  contentObjs &&  contentObjs[c] &&  contentObjs[c].branches ? contentObjs[c].branches.length : 0,
          },
          orientation: contentObjs && contentObjs[c] && contentObjs[c].orientation ? contentObjs[c].orientation : null,
          branches: contentObjs &&  contentObjs[c] &&  contentObjs[c].branches ? contentObjs[c].branches : null,
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
/**
 *
 * @Author Aditi
 * @description get list of all ContentMappings based on array of mongodb ids
 * @date 10/07/2019
 */
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
          for(let i = 0 ; i < contentMappingObj.length ; i++){
              let finalObjElement = contentMappingObj[i];
              const tbookCode = finalObjElement &&
                                finalObjElement.refs && finalObjElement.refs.textbook &&
                                finalObjElement.refs.textbook.code ?
                                finalObjElement.refs.textbook.code : null;
              const topicCode = finalObjElement && finalObjElement.refs &&
                                finalObjElement.refs.topic &&
                                finalObjElement.refs.topic.code ?
                                finalObjElement.refs.topic.code : null;
              let tbookRefsElement = textBookRefs.find(x=>x.code === tbookCode);
              const topicObjElement = topicObj.find(x=>x.code === topicCode);
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
              topicName: topicObjElement && topicObjElement.child ? topicObjElement.child : null,
              coins: finalObjElement && finalObjElement.coins ? finalObjElement.coins : null,
                timgPath: finalObjElement && finalObjElement.timgPath ? finalObjElement.timgPath : null,
              filePath: finalObjElement &&
                        finalObjElement.resource &&
                        finalObjElement.resource.key ? finalObjElement.resource.key : null,
              fileSize: finalObjElement && finalObjElement.resource &&
                        finalObjElement.resource.size ? finalObjElement.resource.size : null,
              mediaType: finalObjElement &&
                         finalObjElement.resource &&
                         finalObjElement.resource.type ? finalObjElement.resource.type : null,
              metaData : finalObjElement.metaData &&
                         finalObjElement.metaData ? finalObjElement.metaData : null,
              count:{
              orientation : finalObjElement && finalObjElement.orientation ?
              finalObjElement.orientation.length : null,
              branches :finalObjElement && finalObjElement.branches ? finalObjElement.branches.length : null,
              }
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
  // console.log('studentId', studentId);
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
  let textbookCodes = [];
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
/**
 *
 * @author Aditi
 * @description Returns a array of jsons for csv conversion based on filters
 * req.body should contain filters of the format ---

	"filters":{
    "contentCategory" :"Reading Material etc.",  //compulsory input
    "textbookCode":"155695623436235d2fe4581",//optional
    "classCode" : "String", //optional
    "subjectCode" : "String",  //optional
    "topicCode" :"String" //optional but no topic code without textbookcode
  }
*/
export async function downloadContentDetails(req, res){
  const args = req.body;
  if(!args.filters){
    throw new Error('Please input filters')
  }
  if(!args.filters.contentCategory){
    throw new Error('Please select a category')
  }
  const filters = args.filters
  return getContentDetails(req.user_cxt,filters).then((response=>{
    res.send(response)
  }))
}
/**
 * @description utility function for function downloadContentDetails
 */
async function makeJSONforCSV(filedata){
  var final = []
  for(var j =0 ; j < filedata.length ;j++){
    const singleData = filedata[j]
    const finalELe = {
      Id : singleData.id,
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
/**
 * @description utility function for function downloadContentDetails
 */
export async function getContentDetails(context,filters={}){
    if(!filters.contentCategory){
      throw new Error('Select A category')
    }
    const findQuery = {
      active: true,
      "content.category" : filters.contentCategory
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
/**
 * @author Aditi
 * @date 10/07/2019
 * @description edit contentMappings based on mongodb id and fields to be updated
 */
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
  updateContent,
  getUniqueDataForValidation,
  getUniqueBranchesForValidation,
}
