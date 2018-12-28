import celery from 'celery-client';
import { config } from '../../../config/environment';
import { uploadToGCS } from '../../../utils/fileUpload';

/**
 * @description Initialize celery connection for parser
 */
function registerCeleryTask(celeryTask, celeryArgs) {
  const broker = new celery.RedisHandler(config.parser.CELERY_BROKER_URL);
  const backend = new celery.RedisHandler(config.parser.CELERY_RESULT_BACKEND);
  const celeryClient = new celery.Client(broker, backend);

  const taskOptions = {
    eta: Date.now(),
    retries: 3,
    queue: config.parser.QUEUE_NS,
  };
  const kwargs = {};
  return new Promise(async (resolve, reject) => {
    celeryClient.putTask(
      `app.${celeryTask}`, celeryArgs, kwargs, taskOptions,
      (err, taskId) => {
        console.info('Sync Tests Task >', taskId);
        if (err) {
          reject(err);
        }
      },
      async (err, celeryResult) => {
        console.info('Result > received');
        if (err) {
          reject(err);
        }
        resolve(celeryResult.result);
      },
    );
  });
}

function getFileArgs(file, url) {
  return {
    link: url,
    options: {
      contentType: file.mimetype,
      filename: file.originalname,
      knownLength: file.size,
    },
  };
}

/**
 * @author Gaurav Chauhan
 * @param {*} req
 * @param {*} res
 * @description rtl to csv converter
 */
export async function getCsv(req, res) {
  if (!req.file) return res.status(400).send({ err: 'file is required' });
  const { originalname } = req.file;
  const extention = originalname.split('.')[1];
  console.info(extention);
  if (extention !== 'rlt') {
    return res.status(400).send({ err: 'only rtl file can be converted' });
  }
  return uploadToGCS(req.file).then((fileUrl) => {
    const parserArgs = [{
      file: getFileArgs(req.file, fileUrl),
    }];
    registerCeleryTask('getCsv', parserArgs)
      .then(result => res.send(result))
      .catch((err) => {
        console.error(err);
        return res.send(err);
      });
  }).catch((err) => {
    console.error(err);
    return res.status(500).send({ err: 'unable to upload file' });
  });
}
/**
 * @author Gaurav Chauhan
 * @param {*} req
 * @param {*} res
 * @description dat to csv converter
 */

export function datConverter(req, res) {
  if (!req.files.datfile) res.status(400).send({ err: 'dat file is required' });
  if (!req.files.datfilekey) res.status(400).send({ err: 'dat key file is required' });

  const datfile = req.files.datfile[0];
  const datfilekey = req.files.datfilekey[0];
  const datfileExtention = datfile.originalname.split('.')[1];
  const datfilekeyExtention = datfilekey.originalname.split('.')[1];

  if (datfileExtention !== 'dat' || (datfilekeyExtention !== 'dat' && datfilekeyExtention !== 'ans')) {
    return res.status(400).send({ err: 'only dat file can be converted' });
  }

  return Promise.all([uploadToGCS(datfile), uploadToGCS(datfilekey)]).then((values) => {
    const datfileUrl = values[0];
    const datfilekeyUrl = values[1];

    const parserArgs = [{
      datfile: getFileArgs(datfile, datfileUrl),
      datfilekey: getFileArgs(datfilekey, datfilekeyUrl),
      total_questions: req.body.total_questions,
    }];

    registerCeleryTask('datConverter', parserArgs)
      .then(result => res.send(result))
      .catch((err) => {
        console.error(err);
        return res.send(err);
      });
  }).catch((err) => {
    console.error(err);
    return res.status(500).send({ err: 'unable to upload file' });
  });
}

/**
 * @author Gaurav Chauhan
 * @param {*} req
 * @param {*} res
 * @description IIT to CSV converter
 */

export function iitConverter(req, res) {
  if (!req.files.file) res.status(400).send({ err: 'iit file is required' });
  if (!req.files.key) res.status(400).send({ err: 'ias key file is required' });

  const file = req.files.file[0];
  const key = req.files.key[0];

  const fileExtention = file.originalname.split('.')[1];
  const keyExtention = key.originalname.split('.')[1];
  if (fileExtention !== 'iit' || keyExtention !== 'ias') {
    return res.status(400).send({ err: 'only iit/ias file can be converted' });
  }
  return Promise.all([uploadToGCS(file), uploadToGCS(key)]).then((values) => {
    const fileUrl = values[0];
    const keyUrl = values[1];

    const parserArgs = [{
      file: getFileArgs(file, fileUrl),
      key: getFileArgs(key, keyUrl),
      testpattern: JSON.parse(req.body.testpattern),
    }];

    registerCeleryTask('iitConverter', parserArgs)
      .then(result => res.send(result))
      .catch((err) => {
        console.error(err);
        return res.send(err);
      });
  }).catch((err) => {
    console.error(err);
    return res.status(500).send({ err: 'unable to upload file' });
  });
}
