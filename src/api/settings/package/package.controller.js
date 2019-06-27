import { getModel as packageModel } from './package.model';
import InstituteModel from '../institute/institute.model';
import { packageList } from '../../../graphql/settings/package/package.query';

export async function createNewPackage(args, context) {
  // console.info('args', args);
  console.log("context:",context);
  const prep={
     packageName :args.packageName,
     packageId : (Date.now()+Math.random().toString()).substring(0,10),
     academicYear:args.academicYear,//
     classCode:args.classCode,//
     subjects:args.subjects,//
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

export async function listOfPackages(args,context) {
  // console.log("context:",context);
  console.log("args",args);
  // // console.log("2",args.academicYear);
  // // console.log("3",args.subjects);
  // // console.log("4",context.email);
  let classCode = args && args.classCode ? args.classCode : null;
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
  console.log("query:",query);
    return packageModel(context).then((reqModel) => {
      return reqModel.find(query).then((final) => {
        //find({childCode: {$in: arrayCollection}}, {child:1, level:1,_id:0});
        // if(!final)
        // {
        //   return res.status(400).end("error message");
        // }
        console.log("json :",final);
        var finalArray=[]
        console.log(final.length);
        for(var x=0;x<final.length;x+=1)
        {
          const l={
            packageName : final[x].packageName,
            reviewedBy : final[x].reviewedBy,
            authoredBy : final[x].authoredBy,
            date : final[x].created_at.toString().substring(4,15),
            time : final[x].created_at.toString().substring(16,21)
          };//store dictionary
          finalArray.push(l);

        }
        console.log("check this:",finalArray);
        return finalArray;
      })
    })
  }

export async function updatePackage(args,context){
  console.log("args:",args);
  console.log("context",context);
  const prep={
    packageName :args.packageName,
    academicYear:args.academicYear,//
    subjects:args.subjects,//
    orientation : args.orientations,
    branches : args.branches,
    studentIds : args.studentIDs,
    // feedback: args.feedback,
 };
 return packageModel(context).then((reqModel) => {
  return reqModel.updateOne({packageId : args.packageId , active : true},{$set:prep}).then((res, err) => {
    if (err) {
      console.error(err);
      return {
        message: 'Error has been encountered while updating data',
        status: 500,
      };
    }
    return {
      message: 'Successfully Updated',
      status: 200,
    };
  });
});
}

export async function feedbackValidate(args,context){
  console.log("context:",context);
  console.log("args :",args);
  let whereObj = {packageId: args.packageId, active: true};
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
        return {
          message: 'Successfully Sent',
          status: 200,
        };
      });
    });

}




// export default {
//   createNewPackage,
//   listOfPackages,
// }
