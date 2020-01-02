import {
  getModel as Tests
} from './test.upload.model';

import {
  getModel as TextBook
} from '../../settings/textbook/textbook.model';

function queryForListTest(args) {
  let activeStatus=true
  if(args.active === false) activeStatus=false 
  let query = {
    find: {
      active: activeStatus
    },
    search: {},
    sort: {
      "test.date": -1
    }
  }

  if (args.searchQuery) {
    query["search"]["value"] = args.searchQuery;
    query["search"]["fields"] = ["mapping.subject.name", "test.name", "mapping.textbook.name", "mapping.class.name"]
  }

  if (args.sortOrder === "asc") {
    query["sort"] = {
      "test.date": 1
    }
  }
  return query;

}

export async function listTest(args, ctx) {
  try {
    const queries = queryForListTest(args);
    let find = {"mapping.textbook.code":{"$in": args.textbookCode}, active: true};
    if(args.gaStatus){
      find["gaStatus"] = args.gaStatus
    }
    const TestSchema = await Tests(ctx);
    let limit = args.limit ? args.limit : 0;
    let skip = args.pageNumber ? args.pageNumber - 1 : 0;
    let data = await TestSchema.dataTables({
      limit: limit,
      skip: skip * limit,
      find: find,
      search: queries.search,
      sort: queries.sort,
    });

    data["pageInfo"] = {
      pageNumber: args.pageNumber,
      recordsShown: data["data"].length,
      nextPage: limit !== 0 && limit * args.pageNumber < data["total"],
      prevPage: args.pageNumber !== 1 && data["total"] > 0,
      totalEntries: data["total"],
      totalPages: limit > 0 ? Math.ceil(data["total"] / limit) : 1,
    }

    return data
  } catch (err) {
    throw err;
  }
}
export async function listTextBooksWithTestSubectWise(args, ctx) {
  try {
    const TestSchema = await Tests(ctx);
    const list = await TestSchema.aggregate([{
      $match: {
        "active": true,
        "mapping.textbook.code" : { "$in" : args.textbookCodes }
      }
    }, {
      $group: {
        "_id": "$mapping.textbook.code",
        count: {
          "$sum": 1
        }
      }
    }, {
      $project: {
        "textbookCode": "$_id",
        count: 1,
        "_id": 0
      }
    }, {
      $lookup: {
        from: "textbooks",
        localField: "textbookCode",
        foreignField: "code",
        as: "textbookInfo"
      }
    }, {
      $unwind: "$textbookInfo"
    }, {
      $project: {
        testCount: "$count",
        textbookCode: 1,
        name: "$textbookInfo.name",
        imageurl: "$textbookInfo.imageUrl"
      }
    }]);
    return list;
  } catch (err) {
    throw err;
  }
}
export async function getDashboardHeadersAssetCountV2(args, context) {
  const {
    classCode,
    subjectCode,
    chapterCode,
    textbookCode,
    branch,
    orientation,
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

  const [ Textbook, ContentMapping ] = await Promise.all([TextBook(context), Tests(context)]);
  const docs = await Textbook.aggregate(textbookAggregateQuery).allowDiskUse(true);

  if(!docs || !docs.length) return {};

  let textbookCodes = []
  docs.forEach(x => {
    textbookCodes = textbookCodes.concat(x.textbookCodes)
  })

  textbookCodes = Array.from(new Set(textbookCodes));

  const contentQuery = { 
    active: true,
    'mapping.textbook.code': { $in: textbookCodes },
  };
  //const contentTypeMatchOrData = getContentTypeMatchOrData(contentCategory);
  // if(contentTypeMatchOrData.length) contentQuery['$or'] = contentTypeMatchOrData;
  
  if (chapterCode) contentQuery['mapping.chapter.code'] = chapterCode;
  const aggregateQuery = []; 
  const contentMatchQuery = {
    $match: contentQuery,
  }
  groupby = 'mapping.textbook.code';
  if(header === 'chapter') groupby = 'mapping.chapter.code';
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