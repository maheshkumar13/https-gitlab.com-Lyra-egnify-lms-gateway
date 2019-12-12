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

export default {
  fetchProgramsBasedOnBoard,
};
