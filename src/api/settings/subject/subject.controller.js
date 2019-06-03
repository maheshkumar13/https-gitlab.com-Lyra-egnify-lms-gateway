import { getModel as SubjectModel } from './subject.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import { getModel as StudentModel } from '../student/student.model';
import { getModel as TextbookModel } from '../textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../conceptTaxonomy/concpetTaxonomy.model'

import { config } from '../../../config/environment';

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
    return Student.findOne({ studentId }, project).cache(config.cacheTimeOut.student)
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
    return SubjectModel(context).then(Subject => Subject.find(query).cache(config.cacheTimeOut.subject));
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

export async function getSubjectTextbookTopic(args, context) {
  return Promise.all([
    SubjectModel(context),
    TextbookModel(context),
    ConceptTaxonomyModel(context),
    getStudentData(context),
  ]).then(([
    Subject,
    Textbook,
    ConceptTaxonomy,
    studentData
  ]) => {
    const subjectQuery = { active: true }  
    if(studentData) {
      const classData = studentData.hierarchy.find(x => x.level === 2);
      subjectQuery['refs.class.code'] = classData.childCode;
      if (studentData.subjects && studentData.subjects.length) {
        const codes = studentData.subjects.map(x => x.code)
        subjectQuery['$or'] = [
          { isMandatory: true },
          { code: {$in: codes} }
        ]
      }
    }
    return Subject.find(subjectQuery,{_id: 0, subject: 1, code: 1, isMandatory: 1}).cache(config.cacheTimeOut.subject).then((subjects) => {
      const subjectcodes = subjects.map( x => x.code)
      const textbookQuery = {
        active: true,
        'refs.subject.code': { $in: subjectcodes }
      }
      if(studentData) {
        const { orientation, hierarchy } = studentData;
        if (orientation) {
          textbookQuery['orientations'] = {$in: [null, "", orientation]}
        }
        if (hierarchy && hierarchy.length) {
          const branchData = hierarchy.find(x => x.level === 5);
          if(branchData && branchData.child) {
            textbookQuery['branches'] = {$in: [null, "", branchData.child]}
          }
        }
      }
      return Textbook.find(textbookQuery,{ _id: 0, name: 1, code: 1, 'refs.subject.code': 1, imageUrl: 1}).cache(config.cacheTimeOut.textbook).then((textbooks) => {
        const textbookCodes = textbooks.map(x => x.code);
        const topicQuery = {
          active: true,
          levelName: 'topic',
          'refs.textbook.code': textbookCodes,
        }
        return ConceptTaxonomy.find(topicQuery,{ _id: 0, child: 1, code: 1, childCode: 1, 'refs.textbook.code': 1}).cache(config.cacheTimeOut.topic).lean().then((topics) => {
          const data = [];
          subjects.forEach( subject => {
            const subjectData = { subject: subject.subject, code: subject.code, next: [], isMandatory: subject.isMandatory }
            const textbooksData = textbooks.filter(x => x.refs.subject.code === subject.code)
            if(textbooksData.length) {
              textbooksData.forEach(textbook => {
                const textbookData = { name: textbook.name, code: textbook.code, next: [], imageUrl: textbook.imageUrl }
                textbookData.next = topics.filter( x => x.refs.textbook.code === textbook.code)
                subjectData.next.push(textbookData)
              })
              data.push(subjectData);
            }
          })
          topics.forEach( x => {
            delete x['refs']
          })
          return data;
        })
      })
    })
  })
} 