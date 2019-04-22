import { getModel } from './instituteHierarchy.model';
import InstituteModel from '../institute/institute.model';

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
          return resp;
        });
    })
    .catch(err => err);
}

function getMongoQueryInstituteHierarchyPaginated(args){
  const query = { active: true };


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

  if (args.ancestorCode) {
    query.$or = [
      { childCode: args.ancestorCode },
      { anscetors: { $elemMatch: { childCode: args.ancestorCode } } },
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


export default {
  fetchNodes,
};
