import { getModel as LogModel } from './logger.model';

export function saveLogObject(doc, context) {
  LogModel(context).then((Log) => {
    Log.create([doc])
    .then(docs => {
      if (docs.length > 0) console.info(`logged request successfully`);
    })
    .catch(err => {
      console.error(err);
      console.error(doc);
      console.error(`Error logging request information into database`);
    });
  }).catch(err => {
    console.error(err);
  })
}

export default { saveLogObject };
