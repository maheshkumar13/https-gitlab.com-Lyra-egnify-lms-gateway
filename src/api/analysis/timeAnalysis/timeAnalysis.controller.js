import celery from 'celery-client';

import { config } from '../../../config/environment';
import { getModel as TimeAnalysisModel } from './timeAnalysis.model';
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
    if(new Date(args.startTime).toString() === 'Invalid Date') {
      return resolve({
        message: 'Invalid date or format',
        validFormat: 'YYYY-MM-DDTHH:MM:SS.SSSZ',
      })
    } else args.startTime = new Date(args.startTime);

    const tempDate = new Date(args.startTime);
    tempDate.setDate(tempDate.getDate() +1)
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
    await SchedulerTimeAnalysis.create({  date: new Date(args.startTime), triggeredType }).catch((err) => {
      console.error(err);
    })

    args.startTime = `${startTime.getUTCFullYear()}-${startTime.getUTCMonth()+1}-${startTime.getUTCDate()} ${startTime.getUTCHours()}:${startTime.getUTCMinutes()}:00`;
    args.endTime =  `${endTime.getUTCFullYear()}-${endTime.getUTCMonth()+1}-${endTime.getUTCDate()} ${endTime.getUTCHours()}:${endTime.getUTCMinutes()}:00`;

    const broker = new celery.RedisHandler(config.celery.CELERY_BROKER_URL);
    const backend = new celery.RedisHandler(config.celery.CELERY_RESULT_BACKEND);
    const celeryClient = new celery.Client(broker, backend);
    console.info('celery config', config.celery);
    const argsC = [{ startTime: args.startTime, endTime: args.endTime}];
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

export async function getTimeAnalysis(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const query = { active: true };
  if (args.studentId) query.studentId = args.studentId;
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
  if(query.isStudent && !args.fullData) {
    if(!args.limit) args.limit = 1;
    const groupQuery = {
      _id: '$studentId',
      data: {$push: { 
        studentId: '$studentId',
        studentName: '$studentName',
        date: '$date',
        totalTimeSpent: '$totalTimeSpent',
      }}
    }
    const agrCountQuery = [{$match: query},{$group: {_id: '$studentId' }},{$count: 'total'}];
    const agrDataQuery = [
      {$match: query},
      {$group: groupQuery},
      {$skip: skip},
      {$limit: args.limit },
      {$unwind: '$data'},
      {$group: { _id: 'all', data: {$push: '$data'}}}
    ];
    const [ countData, objsData ] = await Promise.all([
      TimeAnalysis.aggregate(agrCountQuery).allowDiskUse(true),
      TimeAnalysis.aggregate(agrDataQuery).allowDiskUse(true),
    ])
    const count = countData && countData.length ? countData[0].total : 0;
    const data = objsData && objsData.length ? objsData[0].data : [];
    return [ count, data ];
  }
  return Promise.all([
    TimeAnalysis.count(query),
    TimeAnalysis.find(query).skip(skip).limit(args.limit),
  ]);
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


export async function getTimeAnalysisFilter(args, context) {
  const TimeAnalysis = await TimeAnalysisModel(context);
  const query = { active: true };
  if (args.studentId) query.studentId = args.studentId;
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