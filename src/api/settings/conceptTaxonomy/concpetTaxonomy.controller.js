import { getModel as ConcpetTaxonomyModel } from './concpetTaxonomy.model';
import { getModel as TextbookModel} from '../textbook/textbook.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import { getModel as SubjectModel } from '../subject/subject.model';

import { config } from '../../../config/environment';

const crypto = require('crypto')
const xlsx = require('xlsx');
const csvjson = require('csvjson');
const Excel = require('exceljs');


function validateSheet(req) {
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
		const values = Object.values(data[i]);
		const vals = values.map(x => x.toString().trim());
		if (vals.every(x => x === '')) data.pop();
		else break;
	}

	// deleting empty string keys from all objects
	data.forEach((v) => { delete v['']; }); // eslint-disable-line
	
	// trim and remove whitespace
	data.forEach((obj) => {
		Object.keys(obj).forEach((key) => { obj[key] = obj[key].toString().replace(/\s\s+/g, ' ').trim()})
	})

	// validate mandetory fields
	const codes = {}
	const orderNumbers = {}
	const chapters = {}
	const orderArray = []
	const keysArray = Object.keys(data[0]);
	const mandetoryFields = ['code', 'chapter', 'view order']
	//column headers mismatch
	for (let j = 0; j < mandetoryFields.length; j += 1){
		if(keysArray.indexOf(mandetoryFields[j])==-1){
			result.success = false;
			result.message = `Column headers mismatch.\nHeaders must be code, chapter, view order respectively`
			return result;
		}
	}
	for (let j = 0; j < data.length; j += 1) {
		const obj = data[j]
		if(obj['chapter'] && (!obj['code'] || !obj['view order'])){
			result.success = false;
			let msg = "";
			if(!obj['code']){
				msg = msg.concat(`Chapter code not found for ${j+1}: ${obj['chapter']}\n`);
			}
			if(!obj['view order']){
				msg = msg.concat(`View order not found for ${j+1}: ${obj['chapter']}`);
			}
			result.message = msg;
			return result
		}
		// for(let i=0; i<mandetoryFields.length; i+=1){
		// 	const key = mandetoryFields[i]
		// 	if(!obj[key]) {
		// 		result.success = false;
		// 		result.message = `${key} not found at row ${j+1}`;
		// 		return result
		// 	}
		// }
		if(Number(obj["view order"])==NaN || !Number.isInteger(Number(obj["view order"]))|| Number(obj["view order"])<1){
			result.success = false;
			result.message = `View order must be a non-negative integer. View order is wrong for ${j+1}: ${obj["view order"]}`;
			return result
		}
		if(chapters[obj.chapter]) {
			result.success = false;
			result.message = `Duplicate chapter name present in the uploaded sheet ${j+1}: ${obj.chapter}`;
			return result
		}
		if(codes[obj.code]) {
			result.success = false;
			result.message = `Duplicate chapter code present in the uploaded sheet ${j+1}: ${obj.code}`;
			return result
		}
		if(orderNumbers[obj["view order"]]) {
			result.success = false;
			result.message = `Duplicate view order present in the uploaded sheet ${j+1}: ${obj["view order"]}`;
			return result
		}
		codes[obj.code] = true;
		orderNumbers[obj["view order"]] = true;
		chapters[obj.chapter] = true;
		orderArray.push(Number(obj["view order"]));
	}

	orderArray.sort(function(a, b){return a - b});
	for(let i=1; i<orderArray.length; i++){
		if(!(orderArray[i]==orderArray[i-1]+1)){
			result.success = false;
			let j=0;
			for (j = 0; j < data.length; j += 1){
				if(data[j]["view order"]==orderArray[i]){
					break;
				}
			}
			result.message = `View order cannot be skipped ${j+1}: ${orderArray[i]}`;
			return result
		}
	}

	if(!data.length) {
		result.success = false;
		result.message = `No data found in sheet`;
		return result
	}

	
	req.data = data;
	return result;
	
}

function buildDataTree(data){
	const dataTree = {}
	for(let i = 0; i < data.length; i+=1){
		const code = data[i].code;
		const topic = data[i].chapter;
		const subtopic = data[i].subchapter;
		const viewOrder = Number(data[i]["view order"]);
		if(!dataTree[topic]) dataTree[topic] = { viewOrder, code }
		// if(!dataTree[topic][subtopic]) dataTree[topic][subtopic] = { code }
	}
	return dataTree
}

function buildConcpetTaxonomyTree(dataTree, textbook) {
	const data = [];
	const refs = {
		textbook: {
			name: textbook.name,
			code: textbook.code
		}
	}
	const subjectData = {
		child: textbook.refs.subject.name,
		childCode: textbook.refs.subject.code,
		code: '',
		levelName: 'subject',
		parentCode: 'root',
		refs,
	}
	data.push(subjectData);

	Object.keys(dataTree).forEach((topic) => {
		const topicData = {
			child: topic,
			childCode: `${Date.now()}${crypto.randomBytes(5).toString('hex')}`,
			code: dataTree[topic].code,
			viewOrder: dataTree[topic].viewOrder,
			//viewOrder: "123",
			levelName: 'topic',
			parentCode: subjectData.childCode,
			refs,
		}
		data.push(topicData);
		// Object.keys(dataTree[topic]).forEach((subtopic) => {
		// 	const subtopicData = {
		// 		child: subtopic,
		// 		childCode: `${Date.now()}${crypto.randomBytes(5).toString('hex')}`,
		// 		code: dataTree[topic][subtopic].code,
		//		viewOrder: dataTree[topic]["view order"],
		// 		levelName: 'subtopic',
		// 		parentCode: topicData.childCode,
		// 		refs,
		// 	}
		// 	data.push(subtopicData);
		// })
	})
	
	return data;
}

export async function createConceptTaxonomy(req, res){

	if (!req.body.textbookCode) return res.status(400).end('textbookCode is required')
	if (!req.file) return res.status(400).end('File required');
	

	return TextbookModel(req.user_cxt).then((Textbook) => {
		const query = {
			active: true,
			code: req.body.textbookCode,
		}
		return Textbook.findOne(query).then((textbook) => {
			if(!textbook) return res.status(400).end('Invalid textbook code')
			const validateResult = validateSheet(req);
			if(!validateResult.success) return res.status(400).end(validateResult.message)
			const dataTree = buildDataTree(req.data);
			const concpetTaxonomyTree = buildConcpetTaxonomyTree(dataTree, textbook)
			return ConcpetTaxonomyModel(req.user_cxt).then((ConcpetTaxonomy) => {
				const query = {
					active: true,
					'refs.textbook.code': req.body.textbookCode,
				}
				const patch = {
					active: false,
				}
				return ConcpetTaxonomy.update(query,patch,{multi: true}).then(() => {
					return ConcpetTaxonomy.create(concpetTaxonomyTree).then(()=> {
						return res.send('Concept taxonomy inserted successfully');
					})
				})
			})
		})
	})
}

export async function downloadSample(req, res){
	var workbook = new Excel.Workbook();
	const worksheet = workbook.addWorksheet('My Sheet');
	worksheet.columns = [
		{ header: 'code', key: 'code', width: 10 },
		{ header: 'chapter', key: 'chapter', width: 25 },
		{ header: 'view order', key: 'view order', width: 10},
		// { header: 'subchapter', key: 'subchapter', width: 42 }
	];
	var fileName = 'sample1.xlsx';
	
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

    workbook.xlsx.write(res).then(function(){
        res.end();
    });
}

function getFetchNodesQuery(args){
	const query = { active: true }
	if(args.childCode) query.childCode = args.childCode
	if(args.parentCode) query.parentCode = args.parentCode
	if(args.levelName) query.levelName = args.levelName
	if(args.textbookCode) query['refs.textbook.code'] = args.textbookCode;
	return query;
}



export async function fetchNodes(args, context){
	const query = getFetchNodesQuery(args);
	return ConcpetTaxonomyModel(context).then((ConceptTaxonomy) => {
		return ConceptTaxonomy.find(query);
	})
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

function validateAndGetData(data, classesData, subjectsData, textbooksData){
  const result = {
    success: false,
    essage: 'Invalid data',
    errors: [],
  };
  const docs = [];
  const maxErrorsLimit = 1000;
  const mfields = ['class', 'subject', 'textbook', 'code', 'chapter', 'view order']
  for (let i = 0; i < data.length; i += 1) {
      const obj = data[i];
      for (let j = 0; j < mfields.length; j += 1) {
        if (!obj[mfields[j]]) {
          result.errors.push(`${mfields[j].toUpperCase()} not found at row ${i + 1}`);
          if(result.errors.length > maxErrorsLimit) {
            return [result, docs]
          }
        } else if(mfields[j] === 'view order' && !parseInt(obj[mfields[j]])) {
          result.errors.push(`Invalid VIEW ORDER at row ${i+1} (${obj['view order']})`);
          if(result.errors.length > maxErrorsLimit) {
            return [result, docs]
          } 
        }
      }
    }
	const allbooks = [];
	data.forEach(obj => {
		if(!allbooks.find(x => x.class === obj.class && x.subject === obj.subject && x.textbook === obj.textbook)){
			const temp = {
				class: obj.class,
				subject: obj.subject,
				textbook: obj.textbook,
				chapters: [],
			}
			const fl = data.filter(x => x.class === obj.class && x.subject === obj.subject && x.textbook === obj.textbook)
			fl.forEach(x => {
				temp.chapters.push({
					name: x.chapter,
					order: x['view order'],
					code: x.code,
				})
			})
			allbooks.push(temp);
		}
  })
  
	for(let i = 0; i < allbooks.length; i += 1) {
		const obj = allbooks[i];
		if(!obj) continue;
    
    // Class level validation
    const classObj = classesData.find(x => x.class.toLowerCase() === obj.class.toLowerCase())
		if(!classObj) {
      result.errors.push(`Invalid CLASS (${obj.class})`);
			continue;
		}
		obj.classCode = classObj.classCode;
    obj.class = classObj.class;
    
    // Subject level validation
		const subjectObj = subjectsData.find(x => x.classCode === obj.classCode && x.subject.toLowerCase() === obj.subject.toLowerCase())
		if(!subjectObj) {
      result.errors.push(`Invalid SUBJECT (${obj.class}->${obj.subject})`);
			continue;
		}
		obj.subject = subjectObj.subject;
    obj.subjectCode = subjectObj.subjectCode;
    
    // Textbook level validation
		const textbookObj = textbooksData.find(x => x.classCode === obj.classCode && x.subjectCode === obj.subjectCode && x.textbook.toLowerCase() === obj.textbook.toLowerCase())
		if(!textbookObj) {
      result.errors.push(`Invalid TEXTBOOK (${obj.class}->${obj.subject}->${obj.textbook})`);
			continue;
		}
    obj.textbookCode = textbookObj.code;
    
    // Validating codes
		const codes = obj.chapters.map(x => x.code);
		let ucodes = new Set(codes);
		ucodes = Array.from(ucodes);
		if(codes.length !== ucodes.length) {
      result.errors.push(`Duplicate CODES in (${obj.class}->${obj.subject}->${obj.textbook})`);
    }

    // Validating chapters
		const names = obj.chapters.map(x => x.name)
		let unames = new Set(names);
		unames = Array.from(unames);
		if(names.length !== unames.length){
      result.errors.push(`Duplicate CHAPTERS in (${obj.class}->${obj.subject}->${obj.textbook})`);
    }
    
    // Validating view orders
		const orders = obj.chapters.map(x => x.order)
		for(let i=1; i<=orders.length; i++){
			if(!orders.includes(i.toString())) {
        result.errors.push(`Invalid VIEW ORDERS in (${obj.class}->${obj.subject}->${obj.textbook})`);
				break;
			}
    }

    if(result.errors.length > maxErrorsLimit) {
      return [result, docs]
    }
    
		obj.chapters.forEach(x => {
			const temp = {
				'levelName': 'topic',
				'parentCode': obj.subjectCode,
				'active': true,
				'viewOrder': parseInt(x.order),
				'child': x.name,
				'childCode': Date.now() + crypto.randomBytes(5).toString('hex'),
				'code': x.code,
				'refs': {
					'textbook': {
						'name': obj.textbook,
						'code': obj.textbookCode,
					}
				}
			}
			docs.push(temp)
		})
	}
	if(!result.errors.length) result.success = true;
	return [result, docs]
}

export async function uploadTextbookChapters(req,res) {
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
	const [
		InstituteHierarchy,
		Subject,
    Textbook,
    ConcpetTaxonomy,
	] = await Promise.all([
		InstituteHierarchyModel(req.user_cxt),
		SubjectModel(req.user_cxt),
    TextbookModel(req.user_cxt),
    ConcpetTaxonomyModel(req.user_cxt),
	])
	const [
		classesData,
		subjectsData,
		textbooksData
	] = await Promise.all([
		InstituteHierarchy.aggregate([{$match:{levelName: 'Class'}},{$project:{_id: 0, class: '$child', classCode: '$childCode'}}]),
		Subject.aggregate([{$match: { active: true}},{$project: {subject: 1, classCode: '$refs.class.code', subjectCode: '$code',_id: 0 }}]),
		Textbook.aggregate([{$match: {active: true }},{$project: {code: 1, name: 1, refs: 1, _id: 0}},{$project: {textbook: '$name', subjectCode: '$refs.subject.code', classCode: '$refs.class.code', code: 1}}]),
	]).catch(err => {
		console.error(err);
	})
	let result = {};
	try {
	[ result, data ] = validateAndGetData(data, classesData, subjectsData, textbooksData);
	} catch(err) {
		console.error(err);
	}	
	if (!result.success) {
    return res.send(result);
  }
  const textbookCodes = data.map(x => x.refs.textbook.code);
  return ConcpetTaxonomy.deleteMany({ 'refs.textbook.code': { $in: textbookCodes }})
    .then(() => {
      return ConcpetTaxonomy.create(data).then(() => {
        return res.send({
          message: 'Succeccfully inserted'
        })
      })
    }).catch(err => {
      console.error(err);
      return res.status(400).end('Something went wrong');
    })
}