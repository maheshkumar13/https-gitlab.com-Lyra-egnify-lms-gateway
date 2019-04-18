import { config } from '../config/environment';

const celery = require('celery-client');


/**
 * @param {name of the task to register } taskName
 * @param {arguments for that celery task } args
 */
export async function registerCeleryTask(args, taskName) {
  return new Promise((resolve) => {
    try {
      const broker = new celery.RedisHandler(config.celery.CELERY_BROKER_URL);
      const backend = new celery.RedisHandler(config.celery.CELERY_RESULT_BACKEND);
      const celeryClient = new celery.Client(broker, backend);
      const kwargs = {};
      const taskOptions = {
        eta: Date.now(),
        retries: 3,
        queue: config.celery.QUEUE_NS,
      };
      celeryClient.putTask(
        `app.${taskName}`,
        args,
        kwargs,
        taskOptions,
        (err, taskId) => {
          if (err) {
            console.error(err);
            return resolve({ err: `Unable to perform task : ${taskName}` });
          }
          return resolve({ msg: `Task started : ${taskName}, Task Id : ${taskId} ` });
        },
        (err, celeryResult) => {
          if (err) {
            console.error(err);
          }
          console.info('Result >', celeryResult);
        },
      );
    } catch (err) {
      console.error(err);
      return resolve({ err: 'something went wrong' });
    }
  });
}
export default {
  registerCeleryTask,
};
