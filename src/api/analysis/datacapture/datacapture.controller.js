import celery from 'celery-client';

import { config } from '../../../config/environment';


export async function analysisTrigger(args) {
  return new Promise((resolve) => {
    if (!args.timestamp) {
      const tempDate = new Date();
      const date = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
      date.setDate(date.getDate() - 1);
      args.timestamp = date.toISOString();  // eslint-disable-line
    }
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
          resolve({ trigger: false, dateString: args.timestamp });
          throw new Error('Unable to publish task');
        }
        console.info('Sync Tests Task >', taskId);
        resolve({ trigger: true, dateString: args.timestamp });
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

export default async function manualTrigger(req, res) {
  const args = req.body || {};
  const triggerObj = analysisTrigger(args);
  return res.send(triggerObj);
}
