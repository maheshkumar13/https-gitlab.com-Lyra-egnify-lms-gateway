import { getModel } from './package.model';

export async function createNewPackage(args, context) {
  console.info('args', args);
  return getModel(context).then(Package => Promise(Package.insertOne({})).then((res, err) => {
    if (err) {
      console.error(err);
      return {
        message: 'Error has been encountered while inserting data',
        status: 500,
      };
    }
    return {
      message: 'Successfully Inserted',
      status: 200,
    };
  }));
}

export default {
  createNewPackage,
};
