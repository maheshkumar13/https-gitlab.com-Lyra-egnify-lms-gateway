import { getModel } from './instituteHierarchy.model';

export function fetchNodes(args, context) {
  const filters = args.input;
  // console.log(filters);
  return new Promise((resolve, reject) => {
    filterNodes(filters, context)
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

export default {
  fetchNodes,
};
