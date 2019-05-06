import { getModel as TextbookModel } from '../textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../conceptTaxonomy/concpetTaxonomy.model'; 
import { getModel as ContentMappingModel } from './contentMapping.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
const xlsx = require('xlsx');
const upath = require('upath');


export async function getTextbookWiseTopicCodes(context){
  return ConceptTaxonomyModel(context).then((ConceptTaxonomy) => {
    const aggregateQuery = []

    aggregateQuery.push({
      $match: {
        active: true,
        levelName: 'topic'
      }
    })

    aggregateQuery.push({
      $group: { 
        _id: '$refs.textbook.code', 
        codes: { $addToSet: '$code' } 
      }
    })
    
    return ConceptTaxonomy.aggregate(aggregateQuery).then((docs) => {
      const finalData = {}
      docs.forEach((e) => {
        finalData[e['_id']] = e.codes; 
      })
      return finalData;
    })
    
  }) 
}

export async function getUniqueDataForValidation(context){
  return TextbookModel(context).then((Textbook) => {
    const aggregateQuery = []
    const match = {
      active: true,
    }

    aggregateQuery.push({
      $match: match
    })

    aggregateQuery.push({
      $group: {_id: { 
        class: '$refs.class.name', 
        subject: '$refs.subject.name', 
        textbook: '$name', 
        code: '$code'
      }}
    })


    return Textbook.aggregate(aggregateQuery).allowDiskUse(true).then((data) => {
      const finalData = {}
      data.forEach((e) => {
        if(!finalData[e._id.class]) finalData[e._id.class] = {}
        if(!finalData[e._id.class][e._id.subject]) finalData[e._id.class][e._id.subject] = {}
        if(!finalData[e._id.class][e._id.subject][e._id.textbook]) finalData[e._id.class][e._id.subject][e._id.textbook] = e._id.code
      })
      return finalData;
    })
  })
}

export async function getUniqueBranchesForValidation(context) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    return InstituteHierarchy.distinct('child', { levelName: 'Branch'});
  })
}

function validateSheetAndGetData(req, dbData, textbookData, uniqueBranches) {
	const result = {
		success: true,
		message: ''
	}

	// validate extension
	const name = req.file.originalname.split('.');
	const extname = name[name.length - 1];
	if ( extname !== 'xlsx') {
		result.success = false;
		result.message = 'Invalid extension'
		return result;
	}
	

	// Reading  workbook
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });

  // converting the sheet data to csv
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  	
	// deleting all trailing empty rows
	for (let i = data.length - 1; i >= 0; i -= 1) {
    let values = Object.values(data[i]);
    values = values.map(x => x.toString());
		const vals = values.map(x => x.trim());
		if (vals.every(x => x === '')) data.pop();
		else break;
	}

	// deleting empty string keys from all objects
	data.forEach((v) => { delete v['']; }); // eslint-disable-line
	
	// trim and remove whitespace and chaging keys to lower case
	data.forEach((obj) => {
    const keys = Object.keys(obj)
    for(let i=0; i<keys.length; i+=1){
      const key = keys[i];
      const lowerKey = key.toLowerCase();
      obj[lowerKey] = obj[key].toString().replace(/\s\s+/g, ' ').trim()
      if(key !== lowerKey) delete obj[key];
    }
	})

  const mandetoryFields = [
    'class', 'subject', 'textbook', 'chapter code', 'orientation', 'category',
    'publisher', 'publish year', 'content name', 'content category', 'content type',
    'file path', 'file size', 'media type', 'coins',
  ]
	for (let i = 0; i < data.length; i += 1) {
    const obj = data[i];
    for (let j = 0; j < mandetoryFields.length; j += 1) {
      if(!obj[mandetoryFields[j]]) {
        result.success = false;
        result.message = `${mandetoryFields[j].toUpperCase()} not found at row ${i+1}`;
        return result
      }  
    }
  }
  
  for ( let i = 0; i < data.length; i += 1) {
    const row = i+2
    const obj = data[i]

    if (!dbData[obj.class]) {
      result.success = false;
      result.message = `Invalid CLASS at row ${row}`;
      return result
    }

    if (!dbData[obj.class][obj.subject]) {
      result.success = false;
      result.message = `Invalid SUBJECT at row ${row}`;
      return result
    }

    const textbookCode = dbData[obj.class][obj.subject][obj.textbook]
    if (!textbookCode) {
      result.success = false;
      result.message = `Invalid TEXTBOOK at row ${row}`;
      return result
    }

    if (!textbookData[textbookCode] || !textbookData[textbookCode].includes(obj['chapter code'])) {
      result.success = false;
      result.message = `Invalid CHAPTER CODE at row ${row}`;
      return result
    }

    obj['file path'] = upath.toUnix(obj['file path'])
    
    obj.textbookCode = textbookCode;
    ['class', 'subject', 'textbook'].forEach(e => delete obj[e]);

    const categories = ['A', 'B', 'C']
    if (!categories.includes(obj.category)) {
      result.success = false;
      result.message = `Invalid CATEGORY at row ${row}`;
      return result
    }

    const mediaTypes = ['PDF', 'DOCX', 'DOC', 'MP3', 'MP4', 'JPEG', 'JPG', 'PNG', 'HTML']
    if (!mediaTypes.includes(obj['media type'])) {
      result.success = false;
      result.message = `Invalid MEDIA TYPE at row ${row}`;
      return result
    }

    if(obj['branches']) {
      const branchNames = obj['branches'].split(',').map(x => x.replace(/\s\s+/g, ' ').trim())
      const finalBranchNames = []
      for(let j = 0; j < branchNames.length; j+=1 ){
        const branch = branchNames[j];
        if(!branch) continue;
        if (!uniqueBranches.includes(branch)) {
          result.success = false;
          result.message = `Invalid branch name (${branch}) at row ${row}`;
          return result
        }
        finalBranchNames.push(branch);
      }
      obj['branches'] = finalBranchNames;
    }
    
  }
	if(!data.length) {
		result.success = false;
		result.message = `No valid data found in sheet`;
		return result
	}

	req.data = data;
	return result;
	
}
export async function uploadContentMapping(req, res){
  if (!req.file) return res.status(400).end('File required');
  return Promise.all([
    getUniqueDataForValidation(req.user_cxt),
    getUniqueBranchesForValidation(req.user_cxt),
    getTextbookWiseTopicCodes(req.user_cxt),
    ContentMappingModel(req.user_cxt)
  ]).then(([dbData, uniqueBranches, textbookData, ContentMapping]) => {
    const validate = validateSheetAndGetData(req, dbData, textbookData, uniqueBranches)
    if(!validate.success) return res.status(400).end(validate.message)
    const data = req.data;
    const bulk = ContentMapping.collection.initializeUnorderedBulkOp();
    for(let i = 0; i < data.length; i+=1 ){
      const temp = data[i];
      const coins = temp['coins'] ? temp['coins'] : 0;
      const obj = {
        content : {
          name: temp['content name'],
          category: temp['content category'],
          type: temp['content type']
        },
        resource: {
          key: temp['file path'],
          size: temp['file size'],
          type: temp['media type']
        },
        publication: {
          publisher: temp['publisher'],
          year: temp['publish year']
        },
        coins,
        orientation: temp['orientation'],
        refs: {
          topic: {
            code: temp['chapter code']
          },
          textbook: {
            code: temp['textbookCode']
          }
        },
        branches: temp['branches'],
        category: temp['category'],
        active: true,
      }
      const findQuery = {
        active: true,
        'refs.textbook.code': temp.textbookCode,
        'refs.topic.code': temp['chapter code'],
        'content.name': temp['content name'],
        'content.category': temp['content category'],
        'content.type': temp['content type'],
        'category': temp['category']
      }
      bulk.find(findQuery).upsert().updateOne(obj)
    }
    return bulk.execute().then(() => {
      return res.send('Data inserted/updated successfully')
    })
  }) 
}

export async function getBranchNameAndCategory(context) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    const { rawHierarchy } = context;
    if(rawHierarchy && rawHierarchy.length) {
      const branchData = rawHierarchy.find(x => x.level === 5);
      const project = { _id: 0, child: 1, childCode: 1, category: 1 }
      return InstituteHierarchy.findOne({ childCode: branchData.childCode },project)
    }
    return false
  })
}

function getMongoQueryForContentMapping(args, context){
  const query = { active: true }
  if(args.textbookCode) query['refs.textbook.code'] = args.textbookCode;
  if(args.topicCode) query['refs.topic.code'] = args.topicCode;
  if(args.contentCategory) query['content.category'] = { $in: args.contentCategory }
  if(args.contentType) query['content.type'] = args.contentType;
  if(args.resourceType) query['resource.type'] = { $in: args.resourceType }
  return query;
}

export async function getContentMapping(args, context){
  if(!args.textbookCode) throw new Error('textbookCode required')
  const query = getMongoQueryForContentMapping(args,context)
  return getBranchNameAndCategory(context).then((obj) => {
    if(obj) {
      if (obj.child) {
        query['$or'] = [
          { branches: null },
          { branches: obj.child }
        ]
      }
      if (obj.category) query['category'] = obj.category;
    }
    const skip = (args.pageNumber - 1) * args.limit;
    return ContentMappingModel(context).then((ContentMapping) => {
      return Promise.all([
        ContentMapping.find(query).skip(skip).limit(args.limit),
        ContentMapping.count(query)
      ]).then(([data, count]) => {
        return {
          data,
          count
        }
      })
    })
  })
}