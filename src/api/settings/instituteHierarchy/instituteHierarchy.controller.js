import { getModel } from './instituteHierarchy.model';
import InstituteModel from '../institute/institute.model';

const Excel = require('exceljs');
const xlsx = require('xlsx');
const csvjson = require('csvjson');

function getMongoQuery(fltrs, regex) {
  let filters = [];
  if (fltrs) {
    filters = fltrs;
  }
  const query = {};
  // table filters
  const tableFilters = filters.tableFilters; // eslint-disable-line
  // console.log('tableFilters', tableFilters);
  if (tableFilters && tableFilters.length > 0) { // if table filters exist
    query.$and = [];
    // generate the query for table filters.
    for (let l = 0; l < tableFilters.length; l += 1) {
      const filter = tableFilters[l];
        const level = filter.level ; // eslint-disable-line
      const children = filter.data; // names of the nodes to be filtered.
      // Adding the conditions for each level
      query.$and.push({
        $or:
                  [
                    { anscetors: { $elemMatch: { child: { $in: children }, level } } },
                    { child: { $in: children }, isLeafNode: true, level },
                  ],
      });
    }
    // }
  } // end of query population on table filters.
  if (regex !== undefined) {
    const reString = RegExp(`^${regex}*`, 'i');
    const orArray = [];
    orArray.push({ 'anscetors.child': reString, isLeafNode: true });
    orArray.push({ child: reString, isLeafNode: true });
    query.$or = orArray;
  }
  query.isLeafNode = true;
  return query;
}

export function fetchNodes(args, context) {
  const filters = args.input;
  // console.log(filters);
  return new Promise((resolve, reject) => {
    filterNodes(filters, context) //eslint-disable-line
      .then((docs) => {
        resolve(docs);
      }).catch((err) => {
        reject(err);
      });
  });
}

async function filterNodes(fltrs, context) {
  const InstituteHierarchy = await getModel(context);
  let filters = {};
  if (fltrs) {
    filters = fltrs;
  }

  const query = {};

  // filter nodes on levels
  if (filters.level) {
    query.level = filters.level;
  } else if (filters.levels) {
    query.level = { $in: filters.levels };
  }
  // filter nodes on childCodes
  if (filters.childCode) {
    query.childCode = filters.childCode;
  } else if (filters.childCodes) {
    query.childCode = { $in: filters.childCodes };
  }
  // filter nodes on parent Nodes
  if (filters.parentCode) {
    query.parentCode = filters.parentCode;
  } else if (filters.parentCodes) {
    query.parentCode = { $in: filters.parentCodes };
  }
  if (filters.levelName) {
    query.levelName = filters.levelName;
  }
  if (filters.ancestorCode) {
    query.$or = [
      { childCode: filters.ancestorCode },
      { anscetors: { $elemMatch: { childCode: filters.ancestorCode } } },
    ];
  }
  return new Promise((resolve, reject) => {
    InstituteHierarchy.find(query)
      .then((docs) => {
        resolve(docs);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function getFiltersOnLevel(body, context) {
  const InstituteHierarchy = await getModel(context);
  const { level } = body;
  if (!level) {
    throw new Error('Invalid level');
  } else {
    InstituteHierarchy.distinct('child', { level }).then((doc) => {
      const data = doc;
      return data;
    }).catch(err => err);
  }
}

export async function getDataGrid(body, context) {
  // console.log("body", body);
  const InstituteHierarchy = await getModel(context);
  const Institute = await InstituteModel.getModel(context); //eslint-disable-line
  const { pagination } = body;
  let skip = 0;
  let limit = 100000000;
  if (pagination) {
    try {
      if (pagination.pageNumber) {
        skip = (pagination.pageNumber - 1) * pagination.limit;
        limit = pagination.limit; //eslint-disable-line
      }
    } catch (err) {
      console.error(err);
    }
  }
  const start = skip;
  const end = skip + limit;
  const { sortBy, order } = body;

  return Institute.findOne({})
    .then((instituteDoc) => {
      // console.log("instituteDoc", instituteDoc);
      const { hierarchy } = instituteDoc;
      const keys = [];
      for (let l = 0; l < hierarchy.length; l += 1) {
        keys.push(hierarchy[l].child);
      }
      const templete = {};
      for (let l = 0; l < keys.length; l += 1) {
        templete[keys[l]] = {
          value: '-',
          code: '-',
        };
      }
      const query = getMongoQuery(body.filters, body.regex);
      return InstituteHierarchy
        .find(query)
        .then(async (docs) => {
          // console.log("docs: ", docs);
          let data = [];
          const count = docs.length;
          for (let l = 0; l < docs.length; l += 1) {
            const doc = docs[l];
            const tempJson = JSON.parse(JSON.stringify(templete));
            for (let j = 0; j < doc.anscetors.length; j += 1) {
              tempJson[keys[j]] = {
                value: doc.anscetors[j].child,
                code: doc.anscetors[j].childCode,
              };
            }
            tempJson[keys[doc.level - 1]] = { value: doc.child, code: doc.childCode };
            data.push(tempJson);
          }

          // inplimenting sortBy feature.
          if (sortBy && data.length > 0) { // if sortby has been requested
            const dataPoint = data[0]; // get a datapoint
            // check if sort has been requested on a proper index
            if (Object.prototype.hasOwnProperty.call(dataPoint, sortBy)) {
              data.sort((a, b) =>
                a[sortBy].value.localeCompare(b[sortBy].value));
              if (order !== 1) data.reverse(); // if descecding sort has been requested.
            }
          }

          // Fetching the data of current page.
          if (start > data.length) data = [];
          else if (end > data.length) {
            data = data.slice(start, data.length);
          } else {
            data = data.slice(start, end);
          }
          const resp = {
            count,
            data,
          };
          console.log("resp", resp);
          return resp;
        });
    })
    .catch(err => err);
}

function getMongoQueryInstituteHierarchyPaginated(args){
  const query = { active: true};


  if(args.childCodeList && args.childCodeList.length) {
    query.childCode = {
      $in: args.childCodeList,
    }
  }

  if(args.parentCodeList && args.parentCodeList.length) {
    query.parentCode = {
      $in: args.parentCodeList,
    }
  }

  if (args.ancestorCodeList) {
    query.$or = [
      { childCode: {$in: args.ancestorCodeList} },
      { anscetors: { $elemMatch: { childCode: {$in: args.ancestorCodeList} } } },
    ];
  }

  if (args.levelName) query.levelName = args.levelName

  if (args.category) query.category = args.category

  return query;

}

export async function getInstituteHierarchyPaginated(args, context){
  if(!args.limit) args.limit = 0;
  const query = getMongoQueryInstituteHierarchyPaginated(args);
  const skip = (args.pageNumber - 1) * args.limit;
  return getModel(context).then((InstituteHierarchy) => {
    return Promise.all([
      InstituteHierarchy.find(query).skip(skip).limit(args.limit),
      InstituteHierarchy.count(query)
    ]).then(([data, count]) => {
      return {
        data,
        count
      }
    })
  })
}

export async function getUniqueBoardAndBranch(context, filters={}){
  return getModel(context).then((InstituteHierarchy) => {
    const aggregateQuery = []
    const findQuery = {
      active: true,
      levelName: 'Branch',
    }
    if(filters.ancestorCodeList) {
      findQuery['$or'] = [
        { childCode: {$in: filters.ancestorCodeList} },
        { anscetors: { $elemMatch: { childCode: {$in: filters.ancestorCodeList} } } },
      ];
    }
    return InstituteHierarchy.distinct('child', findQuery)
  })
}


export async function downloadSampleForCategory(req, res){
  const args = req.body;

  if(!args.ancestorCodeList) {
    return res.status(400).end('ancestorCodeList required')
  }

  try {
    args.ancestorCodeList = JSON.parse(args.ancestorCodeList)
  }
  catch(err){
    return res.status(400).end('Invalid ancestorCodeList')
  }

  if(!args.ancestorCodeList.length) {
    return res.status(400).end('ancestorCodeList required')
  }

  return getUniqueBoardAndBranch(req.user_cxt, args).then((data) => {
      if(!data || !data.length) {
        return res.status(400).end('No branches found')
      }
      const finalData = [];
      for(let i = 0; i < data.length; i+=1 ){
        const branch = data[i]
        const temp = {
          'Branch': branch,
          'Category': '',
        }
        finalData.push(temp);
      }
      return res.send(finalData)
  })
}


export async function updateCategory(args, context){
  const { data } = args
  if(!data || !data.length) {
      throw new Error('Empty list')
  }
  const categories = ['A', 'B', 'C']
  return getModel(context).then((InstituteHierarchy) => {
    return getUniqueBoardAndBranch(context).then((uniqueData) => {
      const bulk = InstituteHierarchy.collection.initializeUnorderedBulkOp();
      for(let i=0; i < data.length; i+=1){
        const obj = data[i];
        if(!obj.branch || !obj.category) {
          throw new Error('branch and category are required')
        }
        const uniqueObj = uniqueData.includes(obj.branch)
        if (!uniqueObj) {
          throw new Error(`Inavlid branch(${obj.branch})`)
        }

        if(!categories.includes(obj.category)) {
          throw new Error(`Invalid category for ${obj.branch}`)
        }
        const findQuery = {
          active: true,
          levelName: 'Branch',
          child: obj.branch,
        }
        bulk.find(findQuery).update( { $set: { category: obj.category } }, {multi: true});
      }
      return bulk.execute().then(() => {
        return 'Updated successfully'
      })
    })
  })
}

function validateSheetAndGetData(req) {
  const finalData = []
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

	// trim and remove whitespace
	data.forEach((obj) => {
		Object.keys(obj).forEach((key) => { obj[key] = obj[key].replace(/\s\s+/g, ' ').trim()})
	})

	// validate mandetory fields
	for (let j = 0; j < data.length; j += 1) {
    const obj = data[j]
    if(obj.Branch && obj.Category) {
      const temp = {
        branch: obj.Branch,
        category: obj.Category,
      }
      finalData.push(temp)
    }
	}
	if(!finalData.length) {
		result.success = false;
		result.message = `No valid data found in sheet`;
		return result
	}

	req.data = finalData;
	return result;

}

export async function uploadCategory(req, res){
  if (!req.file) return res.status(400).end('File required');
  const validateResult = validateSheetAndGetData(req);
  if(!validateResult.success) return res.status(400).end(validateResult.message)
  const args = { data: req.data }
  return updateCategory(args, req.user_cxt).then(() => {
    return res.send('data uploaded successfully')
  }).catch((err) => {
    return res.status(400).end(err.message)
  })
}

export default {
  fetchNodes,
};
