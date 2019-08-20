import { getModel as TimeseriesMoldel } from './timeseries.model';

export async function addTimeseries(args, context) {
  if (!context.studentId) {
    throw new Error('Not a student');
  }
  const entryTime = new Date(args.entry);
  const exitTime = new Date(args.exit);
  if (!entryTime.getTime() || !exitTime.getTime() || (entryTime > exitTime)) {
    throw new Error('Invalid date in entry or exit');
  }
  const date = new Date(entryTime.toDateString());
  const timeSpent = Math.round((exitTime - entryTime) / 1000);
  const query = {
    studentId: context.studentId,
    assetId: args.assetId,
    date,
  };
  const obj = {
    studentId: context.studentId,
    assetId: args.assetId,
    date,
  };
  const timestamps = {
    entry: entryTime,
    exit: exitTime,
    medium: args.medium,
  };
  return TimeseriesMoldel(context).then((Timeseries) => {
    return Timeseries.update(query, { $set: obj, $inc: { totalTimeSpent: timeSpent }, $push: { timestamps } }, { upsert: true }).then(() => {
      return 'successfully added';
    });
  });
}

export default {
  addTimeseries,
}

// db.temp.update({b: 'aslam'},{$inc: { a: 10 }, $push: { acd: {al: '3', bl: '4'}}},{upsert: true})
