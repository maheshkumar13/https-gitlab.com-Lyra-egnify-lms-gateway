import { getModel } from '../student/student.model';

export async function fetchProgramsBasedOnBoard(body, context) {
  const Student = await getModel(context);
  // console.log('body', body);
  const args = body.input;
  const query = {};
  if(context.orientations && context.orientations.length){
    query.$and = [{
      orientation: { $in: context.orientations }
    }]
  }
  const programWiseStudentCount = [];
  if (args && args.class && args.class.length) {
    query['hierarchyLevels.L_2'] = { $in: args.class };
  }
  if (args && args.program && args.program.length) {
    query.orientation = { $in: args.program };
  }

  if (args && args.branch && args.branch.length) {
    query['hierarchyLevels.L_5'] = { $in: args.branch };
  }
  const tempProgramWiseStudentCount = await Student.aggregate([
    { $match: query },
    { $project: { orientation: 1, hierarchyLevels: 1 } },
    {
      $group:
      {
        _id:
        { class: '$hierarchyLevels.L_2', program: '$orientation' },
        studentCount: { $sum: 1 },
      },
    }]).allowDiskUse(true);
  tempProgramWiseStudentCount.forEach((programWise) => {
    // console.log(programWise)
    const temp = programWise._id; //eslint-disable-line
    temp.studentCount = programWise.studentCount;
    programWiseStudentCount.push(temp);
  });
  if (programWiseStudentCount && programWiseStudentCount.length) {
    return programWiseStudentCount;
  }
  return 'Please select correct class/board/program';
}

export async function getOrientationFilter(args, context){
  try{
    const branches = args.branches || [];
    const classes = args.classes || [];
    const states = args.states || [];
    const cities = args.cities || [];
    const sections = args.sections || [];

    let query = {"active": true}
    query["$and"] = []
    if(context.orientations && context.orientations.length){
      query["$and"] = [{
        orientation: { $in: context.orientations }
      }]
    }
    if(branches.length){
      query["$and"].push({
        "hierarchy.child":{"$in": branches},
        "hierarchy.level": 5
      })
    }
    if(classes.length){
      query["$and"].push({
        "hierarchy.child":{"$in": classes},
        "hierarchy.level": 2
      })
    }
    if(states.length){
      query["$and"].push({
        "hierarchy.child":{"$in": states},
        "hierarchy.level": 3
      })
    }
    if(cities.length){
      query["$and"].push({
        "hierarchy.child":{"$in": cities},
        "hierarchy.level": 4
      })
    }
    if(sections.length){
      query["$and"].push({
        "hierarchy.child":{"$in": sections},
        "hierarchy.level": 6
      })
    }

    if(!query["$and"].length){
      delete query["$and"]
    }

    const Student = await getModel(context);
    const tempProgramWiseStudentCount = await Student.aggregate([
      { $match: query },
      { $project: { orientation: 1, hierarchyLevels: 1} },
      {
        $group:
        {
          _id:
          { class: '$hierarchyLevels.L_2', program: '$orientation' },
          studentCount: { $sum: 1 },
        },
      },{
        "$project":{
          "studentCount": 1,
          "class": "$_id.class",
          "orientation": "$_id.program",
          "_id":0,
        }
      }]).allowDiskUse(true);
      return tempProgramWiseStudentCount;
  }catch(err){
    console.log(err)
    throw err;
  }
}

export default {
  fetchProgramsBasedOnBoard,
};
