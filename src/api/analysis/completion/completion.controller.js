import { getModel as StudentLedgerModel } from '../../studentLedger/studentLedger.model';
import { getModel as ContentMappingModel } from '../../settings/contentMapping/contentMapping.model';
import { getModel as StudentModel } from '../../settings/student/student.model';
import { getModel as SubjectModel } from '../../settings/subject/subject.model';
import { getModel as TextbookModel } from '../../settings/textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../../settings/conceptTaxonomy/concpetTaxonomy.model';
import { getModel as InstituteHierarchyModel } from '../../settings/instituteHierarchy/instituteHierarchy.model';

import { config } from '../../../config/environment';
import { DynamoDBStreams } from 'aws-sdk';

const _ = require('lodash');

function getContentTypeMatchOrData(contentCategory){
  const orData = [];
  let contentTypes = config.CONTENT_TYPES || {};
  if(contentCategory) {
    if(contentTypes[contentCategory]){
      orData.push({'content.category': contentCategory, 'resource.type': { $in: contentTypes[contentCategory]}});
    } else {
      orData.push({'content.category': contentCategory });
    }
    return orData;
  }
  for(let category in contentTypes){
    orData.push({'content.category': category, 'resource.type': { $in: contentTypes[category]}});
  }
  return orData;
}

export async function getStudentData(context, args) {
    const { studentId } = args;
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
export async function getStudentLevelCompletionStats(args, context) {
    const [
        StudentLedger,
        ContentMapping,
        studentData,
        Subject,
        Textbook,
        ConceptTaxonomy ] = await Promise.all([
        StudentLedgerModel(context),
        ContentMappingModel(context),
        getStudentData(context, args),
        SubjectModel(context),
        TextbookModel(context),
        ConceptTaxonomyModel(context),
    ]);
    if(!studentData) throw new Error('Something went wrong!');
    const assetIds = await StudentLedger.distinct('assetId', { studentId: args.studentId });

    const subjectQuery = { active: true };
    const classData = studentData.hierarchy.find(x => x.level === 2);
    subjectQuery['refs.class.code'] = classData.childCode;
    if ( args.subjectCode ) subjectQuery.code = args.subjectCode;
    else if (studentData.subjects && studentData.subjects.length) {
      const codes = studentData.subjects.map(x => x.code);
      subjectQuery.$or = [
          { isMandatory: true },
          { code: { $in: codes } },
      ];
    }
    const subjects = await Subject.find(subjectQuery, {
        _id: 0, subject: 1, code: 1, isMandatory: 1, viewOrder: 1,
      });
    const subjectCodes = subjects.map(x => x.code);
    const textbookQuery = {
        active: true,
        'refs.subject.code': { $in: subjectCodes },
      };
    if(args.textbookCode) textbookQuery.code = args.textbookCode;
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
    // return textbookQuery;
    const textbooks = await Textbook.find(textbookQuery,{_id: 0, code: 1, name: 1, refs: 1, viewOrder: 1 });
    const textbookCodes = textbooks.map(x => x.code);
    
    const contentAgrQuery = [];
    const contentMatchQuery = {
      active: true, 'refs.textbook.code': {$in: textbookCodes }
    };
    if(args.chapterCode) contentMatchQuery['refs.topic.code'] = args.chapterCode;
    const contentTypeMatchOrData = getContentTypeMatchOrData("");
    if(contentTypeMatchOrData.length) contentMatchQuery['$or'] = contentTypeMatchOrData;
    contentAgrQuery.push({$match: contentMatchQuery});
    contentAgrQuery.push({
      $project: { 
        _id: 0,
        inArray: { $cond: [ { $in: ["$assetId", assetIds ] }, 1, 0] },
        'content.category': 1,
        assetId: 1,
        refs: 1,
      }})
    const overall = { total: 0, completed: 0 };
    if(args.categoryWise === true) {
      contentAgrQuery.push({ $group: {
        _id : '$content.category', total: {$sum: 1}, completed: { $sum: "$inArray"}
      }});
      contentAgrQuery.push({$project: {
        category: '$_id',
        total: 1,
        completed: 1,
        _id: 0,
      }})
      const data = await ContentMapping.aggregate(contentAgrQuery);
      data.forEach(x => {overall.total += x.total; overall.completed += x.completed })
      return { overall, data };
    }
    const chapters = await ConceptTaxonomy.aggregate([
      { $match: { active: true, levelName: 'topic', 'refs.textbook.code': { $in: textbookCodes } }},
      { $sort: { viewOrder: 1} },
      { $group: {
         _id: '$refs.textbook.code',
         chapters: {$push: { child: '$child', code: '$code', viewOrder: '$viewOrder'}}
      }}
    ]);
    const subjectsObj = {};
    subjects.forEach(x => { subjectsObj[x.code] = x});

    const textbooksObj = {};
    textbooks.forEach(x => { textbooksObj[x.code] = x});

    const chaptersObj = {};
    chapters.forEach(x => { chaptersObj[x._id] = {}; x.chapters.forEach(y => chaptersObj[x._id][y.code] = { code: y.code, child: y.child, viewOrder: y.viewOrder })});

    contentAgrQuery.push({
      $group: { 
        _id: { textbookCode: '$refs.textbook.code', chapterCode: '$refs.topic.code' },
        total: {$sum: 1},
        completed: { $sum: "$inArray"},
      }
    })
    
    const assetsStats = await ContentMapping.aggregate(contentAgrQuery);
    const data = {};
    assetsStats.forEach(obj => {
      const textbookCode = obj._id.textbookCode
      const subjectCode = textbooksObj[textbookCode].refs.subject.code;
      const chapterCode = obj._id.chapterCode;      
      if(chaptersObj[textbookCode] && chaptersObj[textbookCode][chapterCode]) {
        overall.total += obj.total;
        overall.completed += obj.completed;
        if(!data[subjectCode]) data[subjectCode] = { 
          name: subjectsObj[subjectCode].subject,
          code: subjectCode,
          total: 0,
          completed: 0,
          viewOrder: subjectsObj[subjectCode].viewOrder || 100,
          next: {},
         }
         data[subjectCode].total += obj.total;
         data[subjectCode].completed += obj.completed;

        if(!data[subjectCode].next[textbookCode]) data[subjectCode].next[textbookCode] = { 
          name: textbooksObj[textbookCode].name,
          code: textbookCode,
          total: 0,
          completed: 0,
          viewOrder: textbooksObj[textbookCode].viewOrder || 100,
          next: {},
        }
        data[subjectCode].next[textbookCode].total += obj.total;
        data[subjectCode].next[textbookCode].completed += obj.completed;

        if(!data[subjectCode].next[textbookCode].next[chapterCode]) data[subjectCode].next[textbookCode].next[chapterCode] = { 
          name: chaptersObj[textbookCode][chapterCode].child,
          code: chapterCode,
          total: 0,
          completed: 0,
          viewOrder: chaptersObj[textbookCode][chapterCode].viewOrder || 100,
        }
        data[subjectCode].next[textbookCode].next[chapterCode].total += obj.total;
        data[subjectCode].next[textbookCode].next[chapterCode].completed += obj.completed;
      }
    })
    const finalData = _.sortBy(Object.values(data), ['viewOrder']).map(x => { delete x['viewOrder']; return x });
    finalData.forEach(subject => {
      subject.next = _.sortBy(Object.values(subject.next), ['viewOrder']).map(x => { delete x['viewOrder']; return x});
      subject.next.forEach(textbook => {
        textbook.next = _.sortBy(Object.values(textbook.next), ['viewOrder']).map(x =>{ delete x['viewOrder']; return x});
      })
    })

    return {overall, 'data': finalData };
}

export async function getAssetCompletionHeaders(args, context) {
    const [
        StudentLedger,
        Student,
        InstituteHierarchy,
        Subject,
        Textbook,
        ConceptTaxonomy,
        ContentMapping, ] = await Promise.all([
        StudentLedgerModel(context),
        StudentModel(context),
        InstituteHierarchyModel(context),
        SubjectModel(context),
        TextbookModel(context),
        ConceptTaxonomyModel(context),
        ContentMappingModel(context),
    ]);
    const data = { };
    const classQuery = { active: true, levelName: 'Class' }
    if(args.className) classQuery.child = { $regex: `^${args.className}$`, $options: 'i' };
    else data.class = []
    const classes = await InstituteHierarchy.find(classQuery,{childCode: 1, child: 1, });
    const classCodes = classes.map(x => x.childCode );

    const subjectQuery = { active: true, 'refs.class.code': { $in: classCodes }};
    if(args.subjectName) subjectQuery.subject = { $regex: `^${args.subjectName}$`, $options: 'i' };
    else data.subject = []
    const subjects = await Subject.find(subjectQuery,{viewOrder: 1, subject: 1, code: 1});
    const subjectCodes = subjects.map(x => x.code);
    

    const textbookQuery = { active: true, 'refs.subject.code': {$in: subjectCodes }};
    if(args.textbookName) textbookQuery.name = { $regex: `${args.textbookName.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}`, $options: 'i' };
    else data.textbook = []
    if(args.branch) textbookQuery.branches ={ $in: ["", null, args.branch] };
    if(args.orientation) textbookQuery.orientation = { $in: ["", null, args.orientation] }
    let textbooks = await Textbook.find(textbookQuery,{viewOrder: 1, name: 1, code: 1, refs: 1});
    if(args.textbookName) textbooks = textbooks.filter(x => x.name.length === args.textbookName.length)
    const textbookCodes = textbooks.map(x => x.code);

    const bQuery = { code: { $in: textbookCodes }, branches: { $nin: ["", null]}, orientations: { $nin: ["", null]} };
    if(args.branch) bQuery.branches = { $in: ["", null, args.branch] };
    if(args.orientation) bQuery.orientations = { $in: ["", null, args.orientation] }
    if(!args.branch && !args.orientation) {
      const [ branches, orientations] = await Promise.all([
        Textbook.distinct('branches', bQuery),
        Textbook.distinct('orientations', bQuery),      
      ])
      data.branch = branches;
      data.orientation = orientations;
    } else if(!args.branch) data.branch = await Textbook.distinct('branches', bQuery);
    else if(!args.orientation) data.orientation = await Textbook.distinct('orientations', bQuery);
    

    const conceptQuery = { active: true, levelName: 'topic', 'refs.textbook.code': {$in: textbookCodes } };
    if(args.chapterName) conceptQuery.child = { $regex: `${args.chapterName.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}`, $options: 'i' }
    else data.chapter = []
    const chapters = await ConceptTaxonomy.aggregate([
      { $match: conceptQuery },
      { $group: { _id: '$refs.textbook.code', chapters: {$push: { child: '$child', code: '$code', viewOrder: '$viewOrder'}}}},
    ])
    const classesObj = {};
    classes.forEach(x => { classesObj[x.childCode] = x.child });

    const subjectsObj = {};
    subjects.forEach(x => { subjectsObj[x.code] = x});

    const textbooksObj = {};
    textbooks.forEach(x => { textbooksObj[x.code] = x});

    const chaptersObj = {};
    chapters.forEach(x => { x.chapters.forEach(y => {
      if(!args.chapterName || (args.chapterName && args.chapterName.length === y.child.length)) {
        if(!chaptersObj[x._id]) chaptersObj[x._id] = {};
        chaptersObj[x._id][y.code] = { code: y.code, child: y.child, viewOrder: y.viewOrder }
      }
    })});

    if(!Object.keys(chapters).length) return {};

    const contentAgrQuery = [];
    const contentMatchQuery = { active: true };
    for(let textbook in chaptersObj) {
      if(!contentMatchQuery.$and) contentMatchQuery.$and = [{ '$or': []}];
      contentMatchQuery.$and[0].$or.push({'refs.textbook.code': textbook, 'refs.topic.code': {$in: Object.keys(chaptersObj[textbook])}});
    }
    const contentTypeMatchOrData = getContentTypeMatchOrData("");
    if(contentTypeMatchOrData.length) {
      if(!contentMatchQuery.$and) contentMatchQuery.$and = [];
      contentMatchQuery.$and.push({$or:contentTypeMatchOrData});
    }
    contentAgrQuery.push({$match: contentMatchQuery});
    contentAgrQuery.push({
      $group: { 
        _id: { textbookCode: '$refs.textbook.code', chapterCode: '$refs.topic.code' },
    }})
    const assetsStats = await ContentMapping.aggregate(contentAgrQuery);
    assetsStats.forEach(obj => {
      const textbook = textbooksObj[obj._id.textbookCode].name;
      const subject = subjectsObj[textbooksObj[obj._id.textbookCode].refs.subject.code].subject;
      const className = classesObj[textbooksObj[obj._id.textbookCode].refs.class.code];
      if(chaptersObj[obj._id.textbookCode] && chaptersObj[obj._id.textbookCode][obj._id.chapterCode]) {
        const chapter = chaptersObj[obj._id.textbookCode][obj._id.chapterCode].child;
        if(data.class && !data.class.find(x => x.toLowerCase() === className.toLowerCase())) data.class.push(className)
        if(data.subject && !data.subject.find(x => x.toLowerCase() === subject.toLowerCase())) data.subject.push(subject)
        if(data.textbook && !data.textbook.find(x => x.toLowerCase() === textbook.toLowerCase())) data.textbook.push(textbook)
        if(data.chapter && !data.chapter.find(x => x.toLowerCase() === chapter.toLowerCase())) data.chapter.push(chapter)
      }
    })
    for(let key in data) {
      data[key] = data[key].sort();
    }  
    return data;
}

export async function getTeacherLevelCompletionStats(args, context) {
  if(!args.className || !args.branch || !args.orientation) {
    throw new Error('className, branch and orientation required');
  }
  const [
    StudentLedger,
    Student,
    Subject,
    Textbook,
    ConceptTaxonomy,
    ContentMapping, ] = await Promise.all([
    StudentLedgerModel(context),
    StudentModel(context),
    SubjectModel(context),
    TextbookModel(context),
    ConceptTaxonomyModel(context),
    ContentMappingModel(context),
  ]);

  const studentsQuery = { active: true, 'hierarchyLevels.L_2': args.className, 'hierarchyLevels.L_5': args.branch, orientation: args.orientation }
  const students = await Student.find(studentsQuery,{ _id: 0, studentId: 1, studentName: 1});
  if(!students.length) return {};
  const studentNames = {};
  students.map(x => studentNames[x.studentId] = x.studentName);
  const studentIds = Object.keys(studentNames);

  const subjectQuery = { active: true, 'refs.class.name': args.className };
  if (args.subjectName) subjectQuery.subject = args.subject;
  const subjectCodes = await Subject.distinct('code', subjectQuery );
  
  const textbookQuery = { 
    active: true,
    'refs.subject.code': { $in: subjectCodes },
    branches: { $in: ["", null, args.branch ]},
    orientations: { $in: ["", null, args.orientation ]},
  };
  if(args.textbookName) textbookQuery.name = args.textbookName;
  const textbookCodes = await Textbook.distinct('code', textbookQuery);
  
  const conceptQuery = { active: true, levelName: 'topic', 'refs.textbook.code': {$in: textbookCodes } };
  if(args.chapterName) conceptQuery.child = args.chapterName;
  const chapters = await ConceptTaxonomy.aggregate([
    { $match: conceptQuery },
    { $group: { _id: '$refs.textbook.code', chapters: {$push: { child: '$child', code: '$code' }}}},
  ])
  const chaptersObj = {};
  chapters.forEach(x => { x.chapters.forEach(y => {
    if(!args.chapterName || (args.chapterName && args.chapterName.length === y.child.length)) {
      if(!chaptersObj[x._id]) chaptersObj[x._id] = {};
      chaptersObj[x._id][y.code] = { code: y.code, child: y.child }
    }
  })});
  
  const contentAgrQuery = [];
  const contentMatchQuery = { active: true };
  for(let textbook in chaptersObj) {
    if(!contentMatchQuery.$and) contentMatchQuery.$and = [{ '$or': []}];
    contentMatchQuery.$and[0].$or.push({'refs.textbook.code': textbook, 'refs.topic.code': {$in: Object.keys(chaptersObj[textbook])}});
  }
  const contentTypeMatchOrData = getContentTypeMatchOrData("");
  if(contentTypeMatchOrData.length) {
    if(!contentMatchQuery.$and) contentMatchQuery.$and = [];
    contentMatchQuery.$and.push({$or:contentTypeMatchOrData});
  }
  
  contentAgrQuery.push({$match: contentMatchQuery});
  contentAgrQuery.push({
    $group: { 
      _id: '$content.category', total: { $sum: 1 },
  }})
  
  const [assetIds, categorywisecount ] = await Promise.all([
    ContentMapping.distinct('assetId', contentMatchQuery),
    ContentMapping.aggregate(contentAgrQuery)
  ])

  const categorywisecountObj = {}
  categorywisecount.forEach(x => { categorywisecountObj[x._id] = x.total });

  const stdLedgerAgrQuery = [
    { $match: { studentId: { $in: studentIds }, assetId: { $in: assetIds }} },
    {
      $group: {
        _id: { studentId: '$studentId', category: '$category' },
        count: { $sum: 1 },
      }
    }
  ]
  let data = []
  const overall = { completed: 0, total: 0 };
  if(args.studentsData === true ) {
    stdLedgerAgrQuery.push({
      $group: {
        _id: '$_id.studentId',
        data: { $push: { category: '$_id.category', completed: '$count' } }
      }
    })
    const ledgerData = await StudentLedger.aggregate(stdLedgerAgrQuery);
    if(!ledgerData.length) return [];
    ledgerData.forEach(obj => {
      const temp = {
        studentId: obj._id,
        studentName: studentNames[obj._id] || 'N/A',
        stats: []
      }
      obj.data.forEach(x => {
        temp.stats.push({
          category: x.category,
          completed: x.completed,
          total: categorywisecountObj[x.category] || 1,
        })
      })
      data.push(temp);
    })
    return { data }
  }

  stdLedgerAgrQuery.push({
    $group: {
      _id: '$_id.category', completed: { $avg: '$count' },
    }
  })
  const ledgerData = await StudentLedger.aggregate(stdLedgerAgrQuery);
  ledgerData.forEach(obj => {
    overall.completed += Math.round(obj.completed);
    overall.total += categorywisecountObj[obj._id] || 1;
    const temp = {
      category: obj._id,
      completed: Math.round(obj.completed),
      total: categorywisecountObj[obj._id] || 1,
    }
    data.push(temp);
  })
  return {overall, data }
}
