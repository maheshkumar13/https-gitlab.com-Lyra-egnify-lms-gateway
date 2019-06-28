import { getModel as packageModel } from './package.model';
import { getModel as textbookModel } from '../textbook/textbook.model';
import InstituteModel from '../institute/institute.model';
import { packageList } from '../../../graphql/settings/package/package.query';

export async function createNewPackage(args, context) {
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
    packageName: 1,
    academicYear: 1,
    reviewedBy: 1,
    authoredBy: 1,
    classCode: 1,
    orientations: 1,
    branches: 1,  
    studentIds: 1,
    subjects: 1,
  };
  return packageModel(context).then(Package => {
    return (Package.findOne(query1, projection1)).then((packageObj) => {
      if(!packageObj) {
        throw new Error("Package not found");
      }
      const finalResult = {};
      finalResult.packageName = packageObj.packageName;
      finalResult.academicYear = packageObj.academicYear;
      finalResult.reviewedBy = packageObj.reviewedBy;
      finalResult.authoredBy = packageObj.authoredBy;  
      finalResult.class = {};
      finalResult.class.code = packageObj.classCode;                        
      finalResult.orientations = packageObj.orientations;
      finalResult.branches = packageObj.branches;
      finalResult.students = packageObj.studentIds;
      finalResult.subjects = [];
      const subjArray = packageObj.subjects;
      const textbookCodesArray = [];
      for (let i = 0; i<subjArray.length; i++) {
        for (let j = 0; j<subjArray[i].textbookCodes.length; j++) {
          textbookCodesArray.push(subjArray[i].textbookCodes[j]);
        }
      }
      const query2 = {
        code: { $in : textbookCodesArray},
      };
      const projection2 = {
        "name": 1,
        "code": 1,
        "refs.subject.name": 1,
        "refs.subject.code": 1,
        "refs.class.name": 1,
        "refs.class.code": 1,
      };
      const group2 = {
        _id: {
          subject: {
            name: "$refs.subject.name",
            code: "$refs.subject.code",
          },
          class: {
            name: "$refs.class.name",
          },
        },
        textBooks: {
          $addToSet: {
            "textbookCode": "$code",
            "textbookName": "$name",
          }
        }
      }
       return textbookModel(context).then(Textbook => {
        return (Textbook.aggregate([
          { $match: query2 },
          { $project: projection2 },
          { $group: group2 }        
        ]).allowDiskUse(true)).then(result1 => {
          finalResult.class.name = result1[0]._id.class.name;
          for (let i=0; i<result1.length; i++) {
            const obj = {};
            obj.subjectName = result1[i]._id.subject.name;
            obj.subjectCode = result1[i]._id.subject.code;
            obj.textBooks = result1[i].textBooks;
            finalResult.subjects.push(obj);
          }
          return finalResult;
        });
      });
    }).catch(err => err);
  });
}