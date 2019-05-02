import { getModel as TextbookModel } from '../textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../conceptTaxonomy/concpetTaxonomy.model'; 
import { getModel as ContentMappingModel } from './contentMapping.model';

const xlsx = require('xlsx');
const csvjson = require('csvjson');
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

function validateSheetAndGetData(req, dbData, textbookData) {
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
  const csvdata = xlsx.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);

  // converting csvdata to array of json objects
  const data = csvjson.toObject(csvdata);
  	
	// deleting all trailing empty rows
	for (let i = data.length - 1; i >= 0; i -= 1) {
		const values = Object.values(data[i]);
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
      obj[key.toLowerCase()] = obj[key].replace(/\s\s+/g, ' ').trim()
      delete obj[key]
    }
	})

  const mandetoryFields = [
    'class', 'subject', 'textbook', 'chapter code', 'orientation', 'category',
    'publisher', 'publish year', 'content name', 'content category', 'content type',
    'file path', 'file size', 'media type'
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
    getTextbookWiseTopicCodes(req.user_cxt),
    ContentMappingModel(req.user_cxt)
  ]).then(([dbData, textbookData, ContentMapping]) => {
    const validate = validateSheetAndGetData(req, dbData, textbookData)
    if(!validate.success) return res.status(400).end(validate.message)
    const bulk = ContentMapping.collection.initializeUnorderedBulkOp();
    const data = req.data;
    for(let i = 0; i < data.length; i+=1 ){
      const temp = data[i];
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

function getMongoQueryForContentMapping(args){
  const query = { active: true }
  if(args.textbookCode) query['refs.textbook.code'] = args.textbookCode;
  if(args.topicCode) query['refs.topic.code'] = args.topicCode;
  if(args.contentCategory) query['content.category'] = args.contentCategory;
  if(args.contentType) query['content.type'] = args.contentType;
  if(args.resourceType) query['resource.type'] = args.resourceType
  return query;
}

export async function getContentMapping(args, context){
  if(!args.textbookCode) throw new Error('textbookCode required')
  const query = getMongoQueryForContentMapping(args)
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
}