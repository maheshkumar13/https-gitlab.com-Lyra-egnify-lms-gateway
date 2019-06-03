
import { uniqBy, filter } from 'lodash';

/* eslint import/no-named-as-default-member: 0 */
import { getModel } from './student.model';
import { getModel as SubjectModel } from '../subject/subject.model';
import { getLastKLevels } from '../institute/institute.controller';
import { config } from '../../../config/environment';

function getMongoQuery(args) {
  const query = {};
  query.active = true;
  if (args.egnifyId !== undefined && args.egnifyId !== '') {
    query.egnifyId = args.egnifyId;
  }
  if (args.childCode !== undefined && args.childCode !== '') {
    query['hierarchy.childCode'] = args.childCode;
  }
  if (args.filters !== undefined && args.filters !== '') {
    // console.log('filters are', args.filters);
    let filters = {};
    try {
      filters = JSON.parse(args.filters);
    } catch (e) {
      return false;
    }
    const allKeys = Object.keys(filters);
    // console.log('allKeys are', allKeys);
    // console.log('filters are', filters);
    for (let i = 0; i < allKeys.length; i += 1) {
      if (allKeys[i] === 'hierarchy') {
        const hierarchy = filters.hierarchy; // eslint-disable-line
        query.$and = [];
        for (let j = 0; j < hierarchy.length; j += 1) {
          const tmp = {};
          tmp.$and = [];
          const tmp2 = {};
          tmp2['hierarchy.level'] = hierarchy[j].level;
          tmp2['hierarchy.child'] = {};
          tmp2['hierarchy.child'].$in = hierarchy[j].child;
          // console.log('tmp2 is', tmp2);
          tmp.$and.push(tmp2);
          query.$and.push(tmp);
        }
      } else {
        query[allKeys[i]] = {};
        query[allKeys[i]].$in = filters[allKeys[i]];
      }
    }
  }
  if (args.regex !== undefined) {
    const fields = (args.studentIdAndNameOnly) ?
      ['studentId', 'studentName'] :
      ['studentId', 'studentName', 'fatherName', 'gender', 'egnifyId', 'hierarchy.child'];
    const reString = `^${args.regex}`;
    const reTemplate = {
      $regex: reString,
      $options: '$i',
    };
    const orArray = [];
    for (let i = 0; i < fields.length; i += 1) {
      const tempJson = {};
      tempJson[fields[i]] = reTemplate;
      orArray.push(tempJson);
    }
    query.$or = orArray;
  }
  return query;
}

export async function getStudents(args, context) { // eslint-disable-line
  const Student = await getModel(context);
  console.info('args', args);
  const query = getMongoQuery(args);
  if (query === false) {
    return false;
  }
  const sortByQuery = {};

  if (args.sortby === undefined) {
    sortByQuery.studentId = 1;
  } else {
    sortByQuery[args.sortby] = 1;
    if (args.order !== undefined && args.order === -1 || args.order === 1) { //eslint-disable-line
      sortByQuery[args.sortby] = args.order;
    }
  }
  const data = {};
  return Student.find(query).sort(sortByQuery)
    .skip((args.pageNumber - 1) * args.limit)
    .limit(args.limit)
    .then(async result => Student.count(query).then(async (count) => {
      const hierarchy = await getLastKLevels(context, 3);
      hierarchy.sort((a, b) => a.level < b.level);
      const modResults = JSON.parse(JSON.stringify(result));
      for (let i = 0; i < modResults.length; i += 1) {
        let temp = modResults[i].hierarchy[0];
        if (temp.level === hierarchy[0].level) {
            continue;    // eslint-disable-line
        }
        for (let j = 0; j < 0; j += 1) {
          if (temp.level !== hierarchy[j].level) {
            modResults[i].hierarchy[j] = {};
          } else {
            const temp2 = modResults[i].hierarchy[j];
            modResults[i].hierarchy[j] = temp;
            temp = temp2;
          }
        }
      }
      data.students = modResults;
      data.hierarchy = hierarchy;
      data.count = count;
      return data;
    }))
    .catch(err => err);
}

export async function getUniqueValues(args, context) {
  const Student = await getModel(context);

  // const args = args.body;
  console.info(args);
  const { childCode } = args;
  const query = childCode ? { 'hierarchy.childCode': { $in: childCode } } : {};

  if (args.level !== undefined && args.level !== '') {
    return Student.distinct('hierarchy', query).then((docs) => {
      const modDocs = JSON.parse(JSON.stringify(docs));
      const picked = filter(modDocs, x => x.level === parseInt(args.level)); //eslint-disable-line

      const values = uniqBy(picked, 'child');
      return values;
    });
  } else if (args.key !== undefined && args.key !== '') {
    return Student.distinct(args.key, query).then(docs => docs);
  }
  return [];
}

export async function numberOfStudentsByLastNode(args, context) { // eslint-disable-line
  // console.log('args', args);
  const Student = await getModel(context);

  let list = [];
  try {
    list = JSON.parse(args.body.list);
  } catch (e) {
    return e;
  }

  Student.aggregate([
    { $match: { 'hierarchy.childCode': { $in: list }, active: true } },
    { $unwind: '$hierarchy' },
    { $group: { _id: '$hierarchy.childCode', count: { $sum: 1 } } },
  ]).then((docs) => {
    const result = {};
    for (let i = 0; i < docs.length; i += 1) {
      if (list.includes(docs[i]._id)) { // eslint-disable-line
        result[docs[i]._id] = docs[i].count; // eslint-disable-line
      }
    }
    return result;
  });
}

export async function getStudentDetailsById(args, context) { // eslint-disable-line
  const Student = await getModel(context);
  return Student.findOne(
    { studentId: args.studentId },
    {
      studentId: 1,
      studentName: 1,
      hierarchyLevels: 1,
      avatarUrl: 1,
      subjects: 1,
      hierarchy: 1,
    },
  ).cache(config.cacheTimeOut.student).then(student => student);
}

export async function updateStudentAvatar(args, context) { // eslint-disable-line
  const Student = await getModel(context);
  return Student.updateOne(
    { studentId: args.studentId },
    { avatarUrl: args.avatarUrl },
  ).then((status) => {
    if (status.nModified > 0) {
      return `AvatarUrl has been updated for ${args.studentId}`;
    }
    return `StudentId ${args.studentId} Not found `;
  }).catch((err) => {
    console.info(err);
    return 'AvatarUrl updation is FAILED';
  });
}

export async function updateStudentSubjects(args, context) {
  if (!args.studentId || !args.subjectCodes || !args.subjectCodes.length) {
    throw new Error('Insufficient data');
  }
  return Promise.all([
    getModel(context),
    SubjectModel(context),
  ]).then(([Student, Subject]) => Promise.all([
    Student.findOne({ studentId: args.studentId }),
    Subject.find({ code: { $in: args.subjectCodes } }),
  ]).then(([studentData, subjectsData]) => {
    const finalSubjects = [];
    if (!studentData) throw new Error('Invalid studentId');
    if (!subjectsData || !subjectsData.length) throw new Error('Invalid subjects');
    const classData = studentData.hierarchy.find(x => x.level === 2);
    for (let i = 0; i < args.subjectCodes.length; i += 1) {
      const subjectCode = args.subjectCodes[i];
      const tempSubject = subjectsData.find(x => x.code === subjectCode &&
        x.refs.class.code === classData.childCode);
      if (!tempSubject) throw new Error('Invalid subject data');
      if (tempSubject.isMandatory === true) {
        throw new Error('Mandetory subjects can not be added');
      }
      finalSubjects.push({
        subject: tempSubject.subject,
        code: tempSubject.code,
      });
    }
    const query = {
      studentId: args.studentId,
    };
    const patch = {
      subjects: finalSubjects,
    };
    return Student.update(query, patch).then(() => 'Subjects updated successfully');
  }));
}
export default{
  getStudents,
  getUniqueValues,
  numberOfStudentsByLastNode,
  getStudentDetailsById,
  updateStudentAvatar,
  updateStudentSubjects,
};
