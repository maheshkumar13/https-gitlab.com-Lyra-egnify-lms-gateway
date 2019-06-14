import { getModel } from './institute.model';

export async function getInstituteDetails(args, context) {
  // console.log(args);
  const Institute = await getModel(context);
  return Institute.findOne({}).exec().then(doc => [doc]).catch(err => err);
}

export async function getLastKLevels(context, k) {
  const Institute = await getModel(context);
  return new Promise((resolve, reject) => {
    Institute.findOne({}).then((doc) => {
      const { hierarchy } = doc;
      if (k > hierarchy.length) {
        reject();
      } else {
        const hierarchyLength = hierarchy.length;
        const lastKLevels = hierarchy.slice(hierarchyLength - k, hierarchyLength);
        resolve(lastKLevels);
      }
    });
  });
}

export default {
  getInstituteDetails,
  getLastKLevels,
};
