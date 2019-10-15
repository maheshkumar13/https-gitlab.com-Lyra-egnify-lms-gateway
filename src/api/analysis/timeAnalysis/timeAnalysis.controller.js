import celery from 'celery-client';

import { config } from '../../../config/environment';
import { getModel as TimeAnalysisModel } from './timeAnalysis.model';
import { getModel as SchedulerTimeAnalysisModel } from './schedulerTimeAnalysis.model';

const cron = require('node-cron');

export async function analysisTrigger(args) {
  return new Promise(async (resolve) => {
    console.info('triggering at', new Date(), args);
    if (!args.timestamp) {
      const tempDate = new Date();
      const date = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
      date.setDate(date.getDate() - 1);
      args.timestamp = date.toISOString();  // eslint-disable-line
    }
    const SchedulerTimeAnalysis = await SchedulerTimeAnalysisModel();
    const isTriggered = await SchedulerTimeAnalysis.findOne({ date: new Date(args.timestamp) });
    if (isTriggered && !args.manualTrigger) {
      const message = `Alreday triggered for ${args.timestamp}`;
      console.info(message);
      return resolve({ message });
    }
    const triggeredType = args.manualTrigger ? 'manual' : 'auto';
    await SchedulerTimeAnalysis.create({ date: new Date(args.timestamp), triggeredType });
    const broker = new celery.RedisHandler(config.celery.CELERY_BROKER_URL);
    const backend = new celery.RedisHandler(config.celery.CELERY_RESULT_BACKEND);
    const celeryClient = new celery.Client(broker, backend);
    console.info('celery config', config.celery);

    const argsC = [{ dateString: args.timestamp }];
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
