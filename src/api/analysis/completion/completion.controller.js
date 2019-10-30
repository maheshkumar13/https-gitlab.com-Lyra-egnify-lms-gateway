import { getModel as StudentLedgerModel } from '../../studentLedger/studentLedger.model';
import { getModel as ContentMappingModel } from '../../settings/contentMapping/contentMapping.model';
import { getModel as StudentModel } from '../../settings/student/student.model';
import { getModel as SubjectModel } from '../../settings/subject/subject.model';
import { getModel as TextbookModel } from '../../settings/textbook/textbook.model';
import { getModel as ConceptTaxonomyModel } from '../../settings/conceptTaxonomy/concpetTaxonomy.model';
import { config } from '../../../config/environment';

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