import celery from 'celery-client';

import { config } from '../../../config/environment';
import { getModel as TimeAnalysisModel } from './timeAnalysis.model';
import { getModel as StudentModel } from '../../settings/student/student.model';
import { getStudentIdsByContext } from '../../settings/student/student.controller';

import { getModel as SchedulerTimeAnalysisModel } from './schedulerTimeAnalysis.model';

const cron = require('node-cron');

export async function analysisTrigger(args) {
  return new Promise(async (resolve) => {
    console.info('triggering at', new Date(), args);
    if (!args.startTime) {
      const tempDate = new Date()
      let date = new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());
      date = new Date(date - (330 * 60000));
      date.setDate(date.getDate() - 1);
      args.startTime = date;
    }
    if (new Date(args.startTime).toString() === 'Invalid Date') {
      return resolve({
        message: 'Invalid date or format',
        validFormat: 'YYYY-MM-DDTHH:MM:SS.SSSZ',
      })
    } else args.startTime = new Date(args.startTime);

    const tempDate = new Date(args.startTime);
    tempDate.setDate(tempDate.getDate() + 1)
    const startTime = args.startTime;
    const endTime = tempDate;

    const SchedulerTimeAnalysis = await SchedulerTimeAnalysisModel();
    const isTriggered = await SchedulerTimeAnalysis.findOne({ date: new Date(args.startTime) }).catch(err => {
      console.error(err)
    })
    console.info('isTriggered', isTriggered)
    if (isTriggered && !args.manualTrigger) {
      const message = `Alreday triggered for ${args.timestamp}`;
      console.info(message);
      return resolve({ message });
    }
    const triggeredType = args.manualTrigger ? 'manual' : 'auto';
    await SchedulerTimeAnalysis.create({ date: new Date(args.startTime), triggeredType }).catch((err) => {
      console.error(err);
    })

    args.startTime = `${startTime.getUTCFullYear()}-${startTime.getUTCMonth() + 1}-${startTime.getUTCDate()} ${startTime.getUTCHours()}:${startTime.getUTCMinutes()}:00`;
    args.endTime = `${endTime.getUTCFullYear()}-${endTime.getUTCMonth() + 1}-${endTime.getUTCDate()} ${endTime.getUTCHours()}:${endTime.getUTCMinutes()}:00`;

    const broker = new celery.RedisHandler(config.celery.CELERY_BROKER_URL);
    const backend = new celery.RedisHandler(config.celery.CELERY_RESULT_BACKEND);
    const celeryClient = new celery.Client(broker, backend);
    console.info('celery config', config.celery);
    const argsC = [{ startTime: args.startTime, endTime: args.endTime }];
    const kwargs = {};
    const taskOptions = {
      eta: Date.now(),
      retries: 3,
      // timeLimit: 5,
      queue: config.celery.QUEUE_NS,
    };
    return celeryClient.putTask(
      'app.generate_analysis',
      argsC,
      kwargs,
      taskOptions,
      (err, taskId) => {
        if (err) {
          console.error(err);
          resolve({ trigger: false, timestamp: args.timestamp });
          throw new Error('Unable to publish task');
        }
        console.info('Sync Tests Task >', taskId);
        resolve({ trigger: true, timestamp: args.timestamp });
        return 'Analysis Started';
      },
      (err, celeryResult) => {
        if (err) {
          console.error(err);
          return;
        }
        console.info('Result >', celeryResult);
      },
    );
  });
}

export async function manualTrigger(req, res) {
  const args = req.body || {};
  args.manualTrigger = true;
  const triggerObj = await analysisTrigger(args);
  return res.send(triggerObj);
}
// 0 0 1 * * *
export const triggerTimeAnalysis = cron.schedule('0 0 1 * * *', () => {
  analysisTrigger({});
}, {
  scheduled: false,
  timezone: 'Asia/Kolkata',
});

export async function getStudentLevelTimeAnalysis(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const query = { active: true, isStudent: true };
  if (args.studentId) query.studentId = args.studentId;
  if (args.startDate) {
    query.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!query.date) query.date = {};
    query.date.$lte = args.endDate;
  }
  const skip = (args.pageNumber - 1) * args.limit;
  return Promise.all([
    TimeAnalysis.count(query),
    TimeAnalysis.find(query).skip(skip).limit(args.limit),
  ]);
}

export async function getTeacherLevelTimeAnalysis(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const contextStudentIds = await getStudentIdsByContext(context, args);
  const query = { active: true, isStudent: true, studentId: { $in: contextStudentIds } };
  if (args.startDate) {
    query.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!query.date) query.date = {};
    query.date.$lte = args.endDate;
  }
  const skip = (args.pageNumber - 1) * args.limit;
  const agrQuery = [ 
    { $match: query },
    { $project: { date: 1, category: { $map: { input: { $objectToArray: "$category" }, as: "temp6", in: { k: { $concat: [ "category", "<>", "$$temp6.k" ] }, v: "$$temp6.v.totalTimeSpent" } } }, subject: { $map: { input: { $objectToArray: "$subject" }, as: "temp", in: { k: { $concat: [ "subject", "<>", "$$temp.k" ] }, v: "$$temp.v.totalTimeSpent", category: { $map: { input: { $objectToArray: "$$temp.v.category" }, as: "temp2", in: { k: { $concat: [ "subject", "<>", "$$temp.k", "<>", "category", "<>", "$$temp2.k" ] }, v: "$$temp2.v.totalTimeSpent" } } } } } } } },
    { $project: { category: 1, date: 1, subWiseCategory:{ $reduce: { input: { $map: { input: "$subject", as: "temp3", in: { $map: { input: "$$temp3.category", as: "temp4", in: { k: "$$temp4.k", v: "$$temp4.v" } } } } }, initialValue: [ ], in: { $concatArrays: [ "$$value", "$$this" ] } } },'subject.k': 1, 'subject.v': 1 } },
    { $project: { date: 1, allValues: { $concatArrays: ["$category", "$subject", "$subWiseCategory"]}}},
    { $unwind: "$allValues"},
    { $group: { _id: { date: "$date", value: '$allValues.k'}, totalTimeSpent: { $sum: "$allValues.v"}}},
    { $group: { _id: "$_id.date", values: { $push: { key: "$_id.value", value: "$totalTimeSpent" }}}},
    { $skip: skip },
  ]
  if(args.limit > 0) agrQuery.push({ $limit: args.limit });
  return Promise.all([
    TimeAnalysis.aggregate(agrQuery).allowDiskUse(true),
    TimeAnalysis.aggregate([{$match: query},{$group: { _id: '$date', totalStudents: { $sum: 1 }, totalTimeSpent: { $sum: '$totalTimeSpent'}}}]).allowDiskUse(true),
  ]).then(([data, countData]) => {
    const countObj = {};
    countData.forEach(x => { countObj[x._id] = { totalStudents: x.totalStudents, totalTimeSpent: x.totalTimeSpent }})
    const docs = [];
    data.forEach(obj => {
      const temp = { date: obj._id, subject: {}, category: {}, totalStudents: countObj[obj._id].totalStudents, totalTimeSpent: countObj[obj._id].totalTimeSpent };
      obj.values.forEach(x => {
        const keys = x.key.split('<>');
        obj = temp;
        while(keys.length){
          const sl = keys.splice(0,2);
          const key = sl[0];
          const value = sl[1];
          if(!obj[key]) obj[key] = {}
          if(!obj[key][value]) obj[key][value] = {}
          obj = obj[key][value];
        }
        obj.totalTimeSpent = x.value;
      })
      docs.push(temp);
    })
    return [docs.length, docs];
  })

}

export async function getTimeAnalysis(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const query = { active: true };
  
  if (args.class) query['refs.class.name'] = args.class;
  if (args.branch) query['refs.branch.name'] = args.branch;
  if (args.orientation) query['refs.orientation.name'] = args.orientation;
  if (args.startDate) {
    query.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!query.date) query.date = {};
    query.date.$lte = args.endDate;
  }
  query.isStudent = (args.isStudent === true);
  if (!query.isStudent) {
    if (!args.class) query['refs.class'] = { $exists: false };
    if (!args.branch) query['refs.branch'] = { $exists: false };
    if (!args.orientation) query['refs.orientation'] = { $exists: false };
  }
  const skip = (args.pageNumber - 1) * args.limit;
  if (query.isStudent && !args.fullData) {
    if (!args.limit) args.limit = 1;
    const groupQuery = {
      _id: '$studentId',
      data: {
        $push: {
          studentId: '$studentId',
          studentName: '$studentName',
          date: '$date',
          totalTimeSpent: '$totalTimeSpent',
        }
      }
    }
    const agrCountQuery = [{ $match: query }, { $group: { _id: '$studentId' } }, { $count: 'total' }];
    const agrDataQuery = [
      { $match: query },
      { $group: groupQuery },
      { $skip: skip },
      { $limit: args.limit },
      { $unwind: '$data' },
      { $group: { _id: 'all', data: { $push: '$data' } } }
    ];
    const [countData, objsData] = await Promise.all([
      TimeAnalysis.aggregate(agrCountQuery).allowDiskUse(true),
      TimeAnalysis.aggregate(agrDataQuery).allowDiskUse(true),
    ])

    const count = countData && countData.length ? countData[0].total : 0;
    const data = objsData && objsData.length ? objsData[0].data : [];
    return [count, data];
  }
  return Promise.all([
    TimeAnalysis.count(query),
    TimeAnalysis.find(query).skip(skip).limit(args.limit),
  ]);
}

export async function getTimeAnalysisHeadersv2(args, context){
  const [Student, TimeAnalysis] = await Promise.all([
    StudentModel(context),
    TimeAnalysisModel(context)
  ])
  const contextStudentIds = await getStudentIdsByContext(context,args);
  const timeQuery = { active: true, isStudent: true, studentId: { $in: contextStudentIds } };
  if (args.startDate) {
    timeQuery.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!timeQuery.date) timeQuery.date = {};
    timeQuery.date.$lte = args.endDate;
  }
  const studentIds = await TimeAnalysis.distinct('studentId', timeQuery);
  const data = await Student.aggregate([
    {$match: {active: true, studentId: {$in: studentIds}}},
    {$group: {
      _id: null,
      class: {$addToSet: '$hierarchyLevels.L_2'},
      branch: {$addToSet: '$hierarchyLevels.L_5'},
      section: {$addToSet: '$hierarchyLevels.L_6'},
      orientation: {$addToSet: '$orientation'}
    }}
  ])
  if(data && data.length) return data[0];
  return {};
}

export async function getTimeAnalysisHeaders(args, context) {
  const aggregateQuery = [];
  const matchQuery = {
    active: true,
    isStudent: false,
    'refs.class': { $exists: true },
    'refs.branch': { $exists: true },
    'refs.orientation': { $exists: true },
  };
  if (args.class) matchQuery['refs.class.name'] = args.class;
  if (args.branch) matchQuery['refs.branch.name'] = args.branch;
  if (args.orientation) matchQuery['refs.orientation.name'] = args.orientation;
  if (args.subject) matchQuery[`subject.${args.subject}`] = { $exists: true };
  if (args.startDate) {
    matchQuery.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!matchQuery.date) matchQuery.date = {};
    matchQuery.date.$lte = args.endDate;
  }
  aggregateQuery.push({ $match: matchQuery });

  aggregateQuery.push({ $project: { subject: { $objectToArray: '$subject' }, refs: '$refs' } });

  aggregateQuery.push({ $unwind: '$subject' });
  aggregateQuery.push({
    $group: {
      _id: '$active',
      class: { $addToSet: '$refs.class.name' },
      branch: { $addToSet: '$refs.branch.name' },
      orientation: { $addToSet: '$refs.orientation.name' },
      subject: { $addToSet: '$subject.k' },
    },
  });
  const TimeAnalysis = await TimeAnalysisModel(context);
  const data = await TimeAnalysis.aggregate(aggregateQuery);
  if (!data || !data.length) return {};
  return data[0];
}


export async function getTimeAnalysisStudentsList(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const query = { studentId: { $nin: [null, ""] }, active: true };
  if (args.class) query['refs.class.name'] = args.class;
  if (args.branch) query['refs.branch.name'] = args.branch;
  if (args.orientation) query['refs.orientation.name'] = args.orientation;
  if (args.startDate) {
    query.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!query.date) query.date = {};
    query.date.$lte = args.endDate;
  }

  const skip = (args.pageNumber - 1) * args.limit;
  if (!args.limit) args.limit = 1;
  if (!args.sortBy) args.sortBy = 'studentName';

  let groupQuery = {
    _id: '$studentId', studentName: { $first: '$studentName' },
    data: { $push: { date: '$date', totalTimeSpent: '$totalTimeSpent' } }
  }
  let sortQuery = { studentName: args.sortType }
  if (args.sortBy === 'date' && args.sortValue) {
    groupQuery.dateTotalTimeSpent = {
      $max: {
        $cond: {
          if: { $eq: ['$date', args.sortValue] },
          then: '$totalTimeSpent', else: 0
        }
      }
    }
    sortQuery = { dateTotalTimeSpent: args.sortType }
  }
 
  const agrCountQuery = [{ $match: query }, { $group: { _id: '$studentId' } }, { $count: 'total' }];
  const agrDataQuery = [
    { $match: query },
    { $group: groupQuery },
    { $sort: sortQuery },
    { $project: { _id: 0, studentId: '$_id', studentName: 1, data: 1 } },
    { $skip: skip },
    { $limit: args.limit }
  ];
  const [countData, objsData] = await Promise.all([
    TimeAnalysis.aggregate(agrCountQuery).allowDiskUse(true),
    TimeAnalysis.aggregate(agrDataQuery).allowDiskUse(true),
  ])

  const count = countData && countData.length ? countData[0].total : 0;
  const data = objsData && objsData.length ? objsData : [];
  return [count, data];
}

export async function getTimeAnalysisStudentsListByDay(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const query = { studentId: { $nin: [null, ""] }, active: true };
  if (args.class) query['refs.class.name'] = args.class;
  if (args.branch) query['refs.branch.name'] = args.branch;
  if (args.orientation) query['refs.orientation.name'] = args.orientation;
  if (args.startDate) {
    query.date = { $gte: args.startDate };
  }
  if (args.endDate) {
    if (!query.date) query.date = {};
    query.date.$lte = args.endDate;
  }
  const skip = (args.pageNumber - 1) * args.limit;
  if (!args.limit) args.limit = 10;
  let groupQuery = {
    _id: '$_id.studentId', studentName: { $first: '$studentName' },
    totalTimeSpent: { $sum: '$totalTimeSpent' },
    data: { $push: { weekDay: '$_id.weekDay', totalTimeSpent: '$totalTimeSpent' } },
  }
  if (!args.sortType) args.sortType=1
  let sortQuery = { studentName: args.sortType }
  
  if (args.sortBy === 'totalTimeSpent') {
    sortQuery = { totalTimeSpent: args.sortType }
  }
  if (args.sortBy === 'day' && args.sortValue) {
    groupQuery.day={
     $max: { $cond: { if: { $eq: ['$_id.weekDay', args.sortValue] }, then: '$totalTimeSpent', else: 0 }  },
    }
    sortQuery = { day: args.sortType }
  }
  const agrCountQuery = [{ $match: query }, { $group: { _id: '$studentId' } }, { $count: 'total' }];
  const agrDataQuery = [
    { $match: query },
    {
      $project: {
        studentId: 1, studentName: 1, totalTimeSpent: 1,
        weekDay: { $dayOfWeek: { date: '$date', timezone: "Asia/Kolkata" } }, _id: 0
      }
    },
    {
      $group: {
        _id: { studentId: '$studentId', weekDay: '$weekDay' },
        studentName: { $first: '$studentName' }, totalTimeSpent: { $sum: '$totalTimeSpent' }
      }
    },
    {
      $group: groupQuery
    },
    { $sort: sortQuery},
    { $project: { _id: 0, studentId: '$_id', studentName: 1, totalTimeSpent: 1,data: 1 } },
    { $skip: skip },
    { $limit: args.limit }
  ];
  const [countData, objsData] = await Promise.all([
    TimeAnalysis.aggregate(agrCountQuery).allowDiskUse(true),
    TimeAnalysis.aggregate(agrDataQuery).allowDiskUse(true),
  ])
  const count = countData && countData.length ? countData[0].total : 0;
  const data = objsData && objsData.length ? objsData : [];
  return [count, data];
}

function getDaysCount(startDate, endDate) {
  const dayCounts = [0,0,0,0,0,0,0,0]
  const start = new Date(startDate.toLocaleString("en-US", {timeZone: "Asia/Kolkata"})).getDay()+1;
  let st = start
  let days = 0;
  const value = endDate - startDate;
  if(value>=0) {
    days = (value/(1000 * 3600 * 24)) + 1
  }
  while(true && days){
      days--;
      dayCounts[st] = Math.floor(days/7)+1;
      st++;
      if(st > 7) st=1;
      if(st === start || !days) break;
  }
  return dayCounts;
}

export async function getTimeAnalysisStudentsListByDayv2(args,context) {
  if(!args.sortBy) args.sortBy = 'studentName';
  if(args.sortBy === 'day') {
    if(!args.sortValue) throw new Error('sortValue required if sortBy is day');
    if(args.sortValue < 1 || args.sortValue > 7) throw new Error('Invalid sortValue, range is 1-7');
  }
  if(!args.sortType) args.sortType = 1;
  const [
    contextStudentIds,
    TimeAnalysis
  ] = await Promise.all([
    getStudentIdsByContext(context,args),
    TimeAnalysisModel(context),
  ])
  // return contextStudentIds;
  const dayCounts = getDaysCount(args.startDate, args.endDate);
  const matchQuery = {
    active: true,
    isStudent: true,
    studentId: { $in: contextStudentIds },
    date: {
      $gte: args.startDate,
      $lte: args.endDate,
    }
  }
  const agrQuery = [];
  // try {
  agrQuery.push({
    $match: matchQuery,
  })
  agrQuery.push({
    $project: { _id: 0, day: { $dayOfWeek: { date: '$date', timezone: "Asia/Kolkata" } }, studentId: 1, studentName: 1,totalTimeSpent: 1 }
  })
  agrQuery.push({
    $group: { _id: { studentId: '$studentId', day: '$day'}, totalTimeSpent: { $sum: '$totalTimeSpent'}}
  })
  agrQuery.push({
    $project: { _id: 1, avg: { $divide:['$totalTimeSpent',{ $arrayElemAt: [dayCounts, '$_id.day']}]}}
  })
  const groupQuery = {
    _id: '$_id.studentId',
    totalTimeSpent: { $sum: '$avg'},
    data: { $push: { day: '$_id.day', totalTimeSpent: '$avg'}}
  }
  if (args.sortBy === 'day') {
    groupQuery.day = {
     $max: { $cond: { if: { $eq: ['$_id.day', args.sortValue] }, then: '$avg', else: 0 }  },
    }
  }
  agrQuery.push({
    $group: groupQuery,
  })

  agrQuery.push({
    $lookup: { from: 'studentInfo', localField: '_id', foreignField: 'studentId', as: 'docs'}
  })
  agrQuery.push({$unwind: '$docs'});
  agrQuery.push({
    $project: { studentId: '$_id', studentName: '$docs.studentName', totalTimeSpent: 1, day: 1, class: '$docs.hierarchyLevels.L_2', branch: '$docs.hierarchyLevels.L_5', section: '$docs.hierarchyLevels.L_6', orientation: '$docs.orientation',_id: 0,data: 1}
  })
  const sortQuery = {};
  sortQuery[args.sortBy] = args.sortType;
  agrQuery.push({ $sort: sortQuery })
  const skip = (args.pageNumber - 1) * args.limit;
  agrQuery.push({ $skip: skip })
  if(args.limit) agrQuery.push({$limit: args.limit })
// } catch(err) {
//   console.error(err);
// }
  const agrCountQuery = [{ $match: matchQuery }, { $group: { _id: '$studentId' } }, { $count: 'total' }];
  const [countData, objsData] = await Promise.all([
    TimeAnalysis.aggregate(agrCountQuery).allowDiskUse(true),
    TimeAnalysis.aggregate(agrQuery).allowDiskUse(true),
  ])
  const count = countData && countData.length ? countData[0].total : 0;
  const data = objsData && objsData.length ? objsData : [];
  return [count, data];
}

export async function getTimeAnalysisStudentsListBySubjects(args,context){
  if(!args.sortBy) args.sortBy = 'studentName';
  if(args.sortBy === 'subject' && !args.sortValue) {
    throw new Error('sortValue required if sortBy is subject');
  }
  if(!args.sortType) args.sortType = 1;
  const [
    contextStudentIds,
    TimeAnalysis
  ] = await Promise.all([
    getStudentIdsByContext(context,args),
    TimeAnalysisModel(context),
  ])
  const matchQuery = {
    active: true,
    isStudent: true,
    studentId: { $in: contextStudentIds },
    date: {
      $gte: args.startDate,
      $lte: args.endDate,
    }
  }
  const agrQuery = [];
  // try {
  agrQuery.push({
    $match: matchQuery,
  })

  agrQuery.push({
    $project: { _id: 0, studentId: 1, subjects: { $objectToArray: '$subject'}}
  })

  agrQuery.push({
    $unwind: '$subjects'
  })

  agrQuery.push({
    $group: { _id: { studentId: '$studentId', subject:'$subjects.k'}, totalTimeSpent: {$sum: '$subjects.v.totalTimeSpent'}}
  })

  agrQuery.push({
    $group: {
      _id: '$_id.studentId',
      totalTimeSpent: { $sum: '$totalTimeSpent'},
      data: { $push: { subject: '$_id.subject', totalTimeSpent: '$totalTimeSpent'}}
    }
  })

  agrQuery.push({
    $unwind: '$data'
  })

  const groupQuery = {
      _id: '$_id',
      totalTimeSpent: { $first: '$totalTimeSpent'},
      data: { $push: {
        subject: '$data.subject',
        totalTimeSpent: { $multiply: [100, {$divide:["$data.totalTimeSpent", "$totalTimeSpent"]}]}
    }}
  }

  if (args.sortBy === 'subject') {
    groupQuery.subject = {
     $max: { $cond: { if: { $eq: ['$data.subject', args.sortValue] }, then: { $multiply: [100, {$divide:["$data.totalTimeSpent", "$totalTimeSpent"]}]}, else: 0 }  },
    }
  }

  agrQuery.push({
    $group: groupQuery,
  })

  agrQuery.push({
    $lookup: { from: 'studentInfo', localField: '_id', foreignField: 'studentId', as: 'docs'}
  })
  agrQuery.push({$unwind: '$docs'});
  agrQuery.push({
    $project: { studentId: '$_id', studentName: '$docs.studentName', totalTimeSpent: 1, subject: 1, class: '$docs.hierarchyLevels.L_2', branch: '$docs.hierarchyLevels.L_5', section: '$docs.hierarchyLevels.L_6', orientation: '$docs.orientation',_id: 0,data: 1}
  })
  const sortQuery = {};
  sortQuery[args.sortBy] = args.sortType;
  agrQuery.push({ $sort: sortQuery })
  const skip = (args.pageNumber - 1) * args.limit;
  agrQuery.push({ $skip: skip })
  if(args.limit) agrQuery.push({$limit: args.limit })

  const agrCountQuery = [{ $match: matchQuery }, { $group: { _id: '$studentId' } }, { $count: 'total' }];
  const [countData, objsData] = await Promise.all([
    TimeAnalysis.aggregate(agrCountQuery).allowDiskUse(true),
    TimeAnalysis.aggregate(agrQuery).allowDiskUse(true),
  ])
  const count = countData && countData.length ? countData[0].total : 0;
  const data = objsData && objsData.length ? objsData : [];
  return [count, data];
}
