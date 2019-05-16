import { getModel as ConcpetTaxonomyModel } from './concpetTaxonomy.model';
import { getModel as TextbookModel} from '../textbook/textbook.model';
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
	const mandetoryFields = ['code', 'chapter']
	for (let j = 0; j < data.length; j += 1) {
		const obj = data[j]
		for(let i=0; i<mandetoryFields.length; i+=1){
			const key = mandetoryFields[i]
			if(!obj[key]) {
				result.success = false;
				result.message = `${key} not found at row ${j+1}`;
				return result
			}
		}
		if(codes[obj.code]) {
			result.success = false;
			result.message = `Duplicate code found at row ${j+1}`;
			return result
		}
		codes[obj.code] = true;
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
		if(!dataTree[topic]) dataTree[topic] = { code }
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
		// { header: 'subchapter', key: 'subchapter', width: 42 }
];
	var fileName = 'sample.xlsx';
	
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
		return ConceptTaxonomy.find(query).cache(config.cacheTimeOut.topic);
	})
}