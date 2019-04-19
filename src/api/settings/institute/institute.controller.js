import { getModel } from './institute.model';

export async function getInstituteDetails(args, context) {
  // console.log(args);
  const Institute = await getModel(context);
  return Institute.findOne({}).exec().then(doc => [doc]).catch(err => err);
}

export default {
  getInstituteDetails,
};
