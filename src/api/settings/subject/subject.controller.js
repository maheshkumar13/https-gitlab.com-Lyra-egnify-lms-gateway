import { getModel as SubjectModel } from './subject.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import { getModel as StudentModel } from '../student/student.model';

const crypto = require('crypto');

function getSubjectsQuery(args) {
  const query = { active: true };
  if (args.classCode) query['refs.class.code'] = args.classCode;
  return query;
}

export async function getStudentData(context) {
  const { studentId } = context;
  return StudentModel(context).then((Student) => {
    if(!studentId) return false;
    const project = {
      _id: 0,
      subjects: 1,
      hierarchy: 1,
      active: true,
    }
    return Student.findOne({ studentId }, project)
  })
}
export async function getSubjects(args, context) {
  return getStudentData(context).then((obj) => {
    const query = getSubjectsQuery(args);
    if(obj) {
      const classData = obj.hierarchy.find(x => x.level === 2);
      query['refs.class.code'] = classData.childCode;
      if (obj.subjects && obj.subjects.length && args.all !== true) {
        const codes = obj.subjects.map(x => x.code)
        query['$or'] = [
          { isMandatory: true },
          { code: {$in: codes} }
        ]
      }
    }
    return SubjectModel(context).then(Subject => Subject.find(query));
  })
}

function getObjectCombinations(boards, classes) {
  const data = [];
  boards.forEach((boardCode) => {
    classes.forEach((classCode) => {
      const temp = {
        boardCode,
        classCode,
      };
      data.push(temp);
    });
  });
  return data;
}

async function validateAndGetHierarchyData(context, hierarchyCodes) {
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    const query = {
      active: true,
      childCode: {
        $in: hierarchyCodes,
      },
    };
    const projection = {
      _id: 0,
      child: 1,
      childCode: 1,
      levelName: 1,
    };
    return InstituteHierarchy.find(query, projection);
  });
}

async function insertSubjectsDataByfind(Subject, data) {
  const finalData = [];
  return Promise.all(await data.map(obj => Subject.findOne(obj.findQuery).then((doc) => {
    if (!doc) finalData.push(obj.objData);
  }))).then(() => {
    if (!finalData.length) return true;
    return Subject.create(finalData).then(() => true).catch((err) => {
      console.error(err);
      throw new Error('Something went wrong!');
    });
  });
}

export async function createSubject(args, context) {
  const subject = args.subject ? args.subject.replace(/\s\s+/g, ' ').trim() : '';
  if (
    !subject ||
    !(args.classes && args.classes.length)
  ) {
    throw new Error('subject, classess data required');
  }
  const isMandatory = args.isMandatory === false ? false : true;
  let hierarchyCodes = args.classes;
  return Promise.all([
    validateAndGetHierarchyData(context, hierarchyCodes),
    SubjectModel(context),
  ]).then(([hierarchyData, Subject]) => {
    const data = [];
    args.classes.map((classCode) => {
      const classData = hierarchyData.find(x => x.levelName === 'Class' && x.childCode === classCode);
      if (!classData) throw new Error('Invalid childCodes');
      const findQuery = {
        subject,
        'refs.class.code': classData.childCode,
        'refs.subjecttype.name': 'Scholastics',
        active: true,
      };
      const objData = {
        subject,
        code: `${Date.now()}${crypto.randomBytes(5).toString('hex')}`,
        isMandatory,
        refs: {
          class: {
            name: classData.child,
            code: classData.childCode,
          },
          subjecttype: {
            name: 'Scholastics',
            code: '',
          },
        },
      };
      data.push({
        findQuery,
        objData,
      });
    });
    return insertSubjectsDataByfind(Subject, data).then(() => 'Data inserted successfully').catch((err) => {
      console.error(err);
      throw new Error('Could not insert data');
    });
  })
}
