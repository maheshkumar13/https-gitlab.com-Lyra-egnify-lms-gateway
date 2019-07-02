import { getModel as packageModel } from './package.model';
import { getModel as textbookModel } from '../textbook/textbook.model';	

/**
@description This function displays the package details for a given packageId

@author Shreyas
@date   23/03/2018
*/

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
    feedback: 1,
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
      console.log("\n\n**Context.email  = ", context.email, "\n\n");
      if(context.email === packageObj.authoredBy) {
        finalResult.feedback = packageObj.feedback;
      }
      else {
        finalResult.feedback = null;
      }
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
            "code": "$code",
            "name": "$name",
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