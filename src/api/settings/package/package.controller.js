import { getModel as packageModel } from './package.model';
import InstituteModel from '../institute/institute.model';
import { packageList } from '../../../graphql/settings/package/package.query';
import { getModel as instituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import instituteHierarchyQuery from '../../../graphql/settings/instituteHierarchy/instituteHierarchy.query';
export async function createNewPackage(args, context) {
  const prep={
     packageName :args.packageName,
     packageId : (Date.now().toString()+Math.floor(Math.random() * 1000).toString()),
     academicYear:args.academicYear,//
     classCode:args.classCode,//
     subjects:args.subjects,//
     orientations : args.orientations,
     branches : args.branches,
     studentIds : args.studentIDs,
     reviewedBy: args.reviewedBy.toLowerCase(),//convert to lower
     authoredBy: context.email.toLowerCase()// ""
  };
  return packageModel(context).then(Package => {
    return Package.create(prep).then((res, err) => {
    if (err) {
      console.error(err);
      return {
        message: 'Error has been encountered while inserting data',
        status: 500,
      };
    }
    return `${prep.packageId} successfully created!`;
  });
});
}


async function codeToName(codes  = [],context)
{
  let codesArr=[]
  return instituteHierarchyModel(context).then(instituteHierarchy => {
    return instituteHierarchy.find({childCode: {$in: codes}}, {_id:0, child:1, childCode:1}).then((res, err) => {
      if(err) {
        console.error(err);
        return {
          message: 'Error has been encountered',
          status: 500,
        };
      }
      return res;
    });
  });  
}

function tConv24(time24) {
  var ts = time24;
  var H = +ts.substr(0, 2);
  var h = (H % 12) || 12;
  h = (h < 10)?("0"+h):h;  
  var ampm = H < 12 ? " AM" : " PM";
  ts = h + ts.substr(2, 3) + ampm;
  return ts;
};

export async function listOfPackages(args,context) {
  let classCode = args && args.classCode ? args.classCode : null;
  let classObj = await codeToName([classCode], context);
  let academicYear = args && args.academicYear ? args.academicYear : null
  let subjectCode = args && args.subjectCode ? args.subjectCode : null
  let isAuthor = args && args.isAuthor ? args.isAuthor : false;
  let query = {};
  if(classCode) {
    query.classCode = classCode;
  }
  if(academicYear) {
    query.academicYear = academicYear;
  }
  if(subjectCode) {
    query["subjects.subjectCode"] = subjectCode;
  }
  if(isAuthor) {
    query.authoredBy = context.email;
  } else {
    query.reviewedBy = context.email;
  }
  query.active = true;
  console.log(query)
    return packageModel(context).then((reqModel) => {
      return reqModel.find(query).then((final) => {       
        var finalArray=[]
        for(var x=0;x<final.length;x+=1)
        {
          const tempObj = final[x];
          const l={
            packageName : tempObj && tempObj.packageName ? tempObj.packageName : null,
            academicYear: tempObj && tempObj.academicYear ? tempObj.academicYear : null,
            reviewedBy : tempObj && tempObj.reviewedBy ? tempObj.reviewedBy : null,
            authoredBy : tempObj && tempObj.authoredBy ? tempObj.authoredBy : null,
            subjects: tempObj && tempObj.subjects ? tempObj.subjects : null,
            orientations: tempObj && tempObj.orientations ? tempObj.orientations : null,
            branches: tempObj && tempObj.branches ? tempObj.branches : null,
            students: tempObj && tempObj.students ? tempObj.students : null,
            class: classObj ? classObj.find(x=>x.childCode === classCode) : null,
            date: tempObj && tempObj.created_at ? tempObj.created_at.toString().substring(4,15) : null,
            time: tempObj && tempObj.created_at ? tConv24(tempObj.created_at.toString().substring(16,21)) : null,
          };//store dictionary
          finalArray.push(l);
        }
        return finalArray;  
      })
    })
  }

export async function updatePackage(args,context){
  let packageName = args && args.packageName ? args.packageName : null
  let academicYear=args && args.academicYear ? args.academicYear : null
  let subjects=args && args.subjects ? args.subjects : null
  let orientation = args && args.orientation ? args.orientation : null
  let branches = args && args.branches ? args.branches : null
  let studentIds = args && args.students ? args.students : null

 let query = {}
 if(packageName) {
  query.packageName = packageName;
}if(academicYear) {
  query.academicYear = academicYear;
}if(subjects) {
  query.subjects = subjects;
}if(orientation) {
  query.orientation = orientation;
}if(branches) {
  query.branches = branches;
}if(studentIds) {
  query.studentIds = studentIds;
}
 return packageModel(context).then((reqModel) => {
  return reqModel.updateOne({packageId : args.packageId , active : true},{$set:query}).then((res, err) => {
    if (err) {
      console.error(err);
      return {
        message: 'Error has been encountered while updating data',
        status: 500,
      };
    }
    return "updated successfully!"
  });
});
}

export async function feedbackValidate(args,context){
  let whereObj = {packageId: args.packageId, active: true ,reviewedBy : context.email};
  let setObj = {};
  if(args && args.feedback && args.status === 'underFeedback') {
    setObj = {
      status: args.status,
      feedback: args.feedback
    }
  } else if(args && !args.feedback && args.status === 'approved') {
    setObj = {
      status: args.status,
    }
  }
  else{
    throw new Error("something went wrong!");
  }
return packageModel(context).then((reqModel) => {
      return reqModel.updateOne(whereObj,{$set: setObj}).then((res, err) => {
        if (err) {
          console.error(err);
          return {
            message: 'Error has been encountered while sending feedback',
            status: 500,
          };
        }
        return "feedback sent successfully!"
      });
    });

}




// export default {
//   createNewPackage,
//   listOfPackages,
//   updatePackage,
//   feedbackValidate
// }

