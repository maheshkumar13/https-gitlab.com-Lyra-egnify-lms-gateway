import { getModel as SubjectModel } from './subject.model';
import { getModel as InstituteHierarchyModel } from '../instituteHierarchy/instituteHierarchy.model';
import { getModel as StudentModel } from '../student/student.model';
import { getModel as TextbookModel } from '../textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../conceptTaxonomy/concpetTaxonomy.model';
import { getModel as ContentMappingModel } from '../contentMapping/contentMapping.model';

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
    if (!studentId) return false;
    const project = {
      _id: 0,
      subjects: 1,
      hierarchy: 1,
      active: true,
      orientation: 1,
    };
    return Student.findOne({ studentId }, project);
  });
}
export async function getSubjects(args, context) {
  return getStudentData(context).then((obj) => {
    const query = getSubjectsQuery(args);
    if (obj) {
      const classData = obj.hierarchy.find(x => x.level === 2);
      query['refs.class.code'] = classData.childCode;
      if (obj.subjects && obj.subjects.length && args.all !== true) {
        const codes = obj.subjects.map(x => x.code);
        query.$or = [
          { isMandatory: true },
          { code: { $in: codes } },
        ];
      }
    }
    return SubjectModel(context).then(Subject => Subject.find(query));
  });
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
  const isMandatory = args.isMandatory !== false;
  const hierarchyCodes = args.classes;
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
  });
}

export async function updateSubject(args, context){
  const subjectCode = args.subjectCode;
  const subject = args.subject ? args.subject.replace(/\s\s+/g, ' ').trim() : '';
  return Promise.all([
    validateAndGetHierarchyData(context, [args.classCode]),
    SubjectModel(context),
    TextbookModel(context),
  ]).then( async ([hierarchyData, Subject, Textbook]) => {
    const classData = hierarchyData.find(x => x.levelName === 'Class' && x.childCode === args.classCode)
    if(!classData) throw new Error('Invalid Class code');
    const findQuery = {
      subject,
      'refs.class.code': classData.childCode,
      'refs.subjecttype.name': 'Scholastics',
      active: true,
      code: { $ne: subjectCode }
    }
    const doc = await Subject.findOne(findQuery);
    if(doc) throw new Error('Subject already there');

    // Subject Find and Patch
    const subjectFind = { code: subjectCode };
    const subjectPatch = {
      subject,
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

    if('isMandatory' in args) subjectPatch['isMandatory'] = args.isMandatory;
    
    // Textbook Find and Patch
    const textbookFind = { 'refs.subject.code': subjectCode };
    const textbookPatch = {
      refs: {
        class: {
          name: classData.child,
          code: classData.childCode,
        },
        subject: {
          name: subject,
          code: subjectCode
        },
      }
    }
    
    return Promise.all([
      Subject.update(subjectFind, {$set: subjectPatch}),
      Textbook.update(textbookFind, {$set: textbookPatch},{multi: true}),
    ]).then(() => {
      return 'Data Updated successfully';
    }).catch(err => {
      console.error(err);
      throw new Error('Something went wrong');
    });
  })
}

export async function deleteSubject(args, context){
  return Promise.all([
    SubjectModel(context),
    TextbookModel(context),
    ConceptTaxonomyModel(context),
    ContentMappingModel(context),
  ]).then( async ([
    Subject,
    Textbook,
    ConceptTaxonomy,
    ContentMapping,
  ]) => {
    
    // de-activate patch
    const deActivePatch = { active: false };

    // subject find
    const subjectFind = { code: args.subjectCode };

    // Textbook Find
    const textbookFind = { 'refs.subject.code': args.subjectCode };
    const textbookCodes = await Textbook.distinct('code', textbookFind);

    // Concept taxonomy Find
    const conceptFind = { 'refs.textbook.code': { $in: textbookCodes } };

    // Content mapping Find
    const contentFind = { 'refs.textbook.code': { $in: textbookCodes } };

    return Promise.all([
      Subject.update(subjectFind, {$set: deActivePatch}),
      Textbook.update(textbookFind, {$set: deActivePatch},{multi: true}),
      ConceptTaxonomy.update(conceptFind, {$set: deActivePatch},{multi: true}),
      ContentMapping.update(contentFind, {$set: deActivePatch},{multi: true}),
    ]).then(() => {
      return 'Subject removed successfully!!';
    }).catch(err => {
      console.error(err);
      throw new Error('Something went wrong');
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
    studentData,
  ]) => {
    const subjectQuery = { active: true };
    if (studentData) {
      const classData = studentData.hierarchy.find(x => x.level === 2);
      subjectQuery['refs.class.code'] = classData.childCode;
      if (studentData.subjects && studentData.subjects.length) {
        const codes = studentData.subjects.map(x => x.code);
        subjectQuery.$or = [
          { isMandatory: true },
          { code: { $in: codes } },
        ];
      }
    }
    return Subject.find(subjectQuery, {
      _id: 0, subject: 1, code: 1, isMandatory: 1, viewOrder: 1,
    }).sort({ viewOrder: 1 }).then((subjects) => {
      const subjectcodes = subjects.map(x => x.code);
      const textbookQuery = {
        active: true,
        'refs.subject.code': { $in: subjectcodes },
      };
      if (studentData) {
        const { orientation, hierarchy } = studentData;
        if (orientation) {
          textbookQuery.orientations = { $in: [null, '', orientation] };
        }
        if (hierarchy && hierarchy.length) {
          const branchData = hierarchy.find(x => x.level === 5);
          if (branchData && branchData.child) {
            textbookQuery.branches = { $in: [null, '', branchData.child] };
          }
        }
      }
      return Textbook.find(textbookQuery, {
        _id: 0, name: 1, code: 1, 'refs.subject.code': 1, imageUrl: 1, viewOrder: 1,
      }).sort({ viewOrder: 1 }).then((textbooks) => {
        const textbookCodes = textbooks.map(x => x.code);
        const topicQuery = {
          active: true,
          levelName: 'topic',
          'refs.textbook.code': textbookCodes,
        };
        return ConceptTaxonomy.find(topicQuery, {
          _id: 0, child: 1, code: 1, childCode: 1, 'refs.textbook.code': 1, viewOrder: 1,
        }).sort({ viewOrder: 1 }).lean().then((topics) => {
          const data = [];
          subjects.forEach((subject) => {
            const subjectData = {
              subject: subject.subject,
              code: subject.code,
              next: [],
              isMandatory: subject.isMandatory,
              viewOrder: subject.viewOrder,
            };
            const textbooksData = textbooks.filter(x => x.refs.subject.code === subject.code);
            if (textbooksData.length) {
              textbooksData.forEach((textbook) => {
                const textbookData = {
                  name: textbook.name,
                  code: textbook.code,
                  next: [],
                  imageUrl: textbook.imageUrl,
                  viewOrder: textbook.viewOrder,
                };
                textbookData.next = topics.filter(x => x.refs.textbook.code === textbook.code);
                subjectData.next.push(textbookData);
              });
              data.push(subjectData);
            }
          });
          topics.forEach((x) => {
            delete x.refs;
          });
          return data;
        });
      });
    });
  });
}



/**
 * @description This function takes an array of subjectIds (args.input), and returns an 
 *              array of JSONs; each JSON contains: subjectName, subjectCode and an 
 *              array of textBooks (containing textbookName, textbookCode)
 * @author Shreyas
 * @date 01/07/2019
 */

export async function getTextbooksForEachSubject(args, context) {
  const subjectsArray = args.input;
  const query = {
    "refs.subject.code": { $in : subjectsArray },
  };
  const projection = {
    "name": 1,
    "code": 1,
    "refs.subject.name": 1,
    "refs.subject.code": 1,
  };
  const group = {
    _id: {
      subject: {
        name: "$refs.subject.name",
        code: "$refs.subject.code",
      },
    },
    textBooks: {
      $addToSet: {
        "code": "$code",
        "name": "$name",
      }
    }
  }
  return TextbookModel(context).then(Textbook => {
    return (Textbook.aggregate([
      { $match: query },
      { $project: projection },
      { $group: group },
    ]).allowDiskUse(true)).then(result => {
      const finalResult = [];
      for (let i=0; i<result.length; i+=1) {
        const subject = {};
        subject.subjectName = result[i]._id.subject.name;
        subject.subjectCode = result[i]._id.subject.code;
        subject.textBooks = result[i].textBooks;
        finalResult.push(subject);
      }
      return finalResult;
    });
  }).catch(err => err);
}

