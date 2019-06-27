import { getModel as packageModel } from './package.model';
import textbookModel, { getModel as texbookModel } from '../textbook/textbook.model';
import InstituteModel from '../institute/institute.model';
import { packageList } from '../../../graphql/settings/package/package.query';

export async function createNewPackage(args, context) {
   console.info('args', args); console.log("context:",context);
  const prep={
     packageName :args.packageName,
     packageId : Date.now()+Math.random().toString(),
     academicYear:args.academicYear,
     classCode:args.classCode,
     subjects:args.subjects,
     orientation : args.orientations,
     branches : args.branches,
     studentIds : args.studentIDs,
     reviewedBy: args.reviewedBy.toLowerCase(),
     authoredBy: context.email.toLowerCase()
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

export async function getPackageDetails(args, context) {
  const query1 = {
    active: true, 
    packageId: args.input,
  };
  const projection1 = {
    orientations: 1,
    branches: 1,  
    studentIds: 1,
    subjects: 1,
  };
  return packageModel(context).then(Package => {
    return (Package.findOne(query1, projection1)).then((packageObj) => {
      const finalResult = {};
      finalResult.orientations = packageObj.orientations;
      finalResult.branches = packageObj.branches;
      finalResult.studentIds = packageObj.studentIds;
      finalResult.subjects = [];
      const subjArray = packageObj.subjects;
      const textbookCodesArray = [];
      for (let i = 0; i<subjArray.length; i++) {
        for (let j = 0; j<subjArray[i].textbookCodes.length; j++) {
          textbookCodesArray.push(subjArray[i].textbookCodes[j]);
        }
      }
      console.log("\nTextbook Codes : \n", textbookCodesArray);
      const query2 = {
        code: { $in : textbookCodesArray},
      };
      const projection2 = {
        "name": 1,
        "code": 1,
        "refs.subject.name": 1,
        "refs.subject.code": 1,
      };
      return textbookModel(context).then(Textbook => {
        return (Textbook.aggregate([
          { $match: query2 },
          { $project: projection2 },
          { $group: { _id: $refs.subject.code } }        
        ]).allowDiskUse(true)).then(result1 => {
          console.log("\n*******\n******\n", JSON.stringify(result1), "\n********\n");
        });
      });
    });
  });
}