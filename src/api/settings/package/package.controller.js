import { getModel as packageModel } from './package.model';
import InstituteModel from '../institute/institute.model';
import { packageList } from '../../../graphql/settings/package/package.query';

export async function createNewPackage(args, context) {
  // console.info('args', args);
  // console.log("context:",context);
  const prep={
     packageName :args.packageName,
     packageId : Date.now()+Math.random().toString(),
     academicYear:args.academicYear,
     classCode:args.classCode,
     subjects:args.subjects,
     orientation : args.orientations,
     branches : args.branches,
     studentIds : args.studentIDs,
     reviewedBy: args.reviewedBy.toLowerCase(),//convert to lower
     authoredBy: context.email.toLowerCase()// ""
  };
  return packageModel(context).then(Package => {
    Package.create(prep).then((res, err) => {
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
  });
});
}

export async function listOfPackages(context) {
  console.log("context:",context);
  return packageModel(context).then((reqModel) => {
    return reqModel.find().then((json) => {
      
    })
  })



}

// export default {
//   createNewPackage,
//   listOfPackages,
// };
