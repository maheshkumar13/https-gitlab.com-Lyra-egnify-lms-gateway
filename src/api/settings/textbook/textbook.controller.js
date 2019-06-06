import { getModel as TextbookModel } from './textbook.model';
import { getModel as InstituteHierarchyModel} from '../instituteHierarchy/instituteHierarchy.model'
import { getModel as SubjectModel } from '../subject/subject.model'
import { getModel as StudentModel } from '../student/student.model'
import { config } from '../../../config/environment';

const crypto = require('crypto')

export async function getStudentData(context) {
  const { studentId } = context;
  return StudentModel(context).then((Student) => {
    if(!studentId) return false;
    const project = {
      _id: 0,
      subjects: 1,
      hierarchy: 1,
      orientation: 1,
      active: true,
    }
    return Student.findOne({ studentId }, project).cache(config.cacheTimeOut.student)
  })
}

function getTextbooksQuery(args){
  const query = { active: true }
  if (args.classCode) query['refs.class.code'] = args.classCode;
  if (args.subjectCode) query['refs.subject.code'] = args.subjectCode;
  if (args.orientation) {
    query['orientations'] = {$in: [null, "", args.orientation]}
  }
  if (args.branch) {
    query['branches'] = {$in: [null, "", args.branch]}
  }
  return query
}
export async function getTextbooks(args, context){
  return getStudentData(context).then((obj) => {
    if(obj && obj.orientation){
      args.orientation = obj.orientation
      const { hierarchy } = obj;
      if (hierarchy && hierarchy.length) {
        const branchData = hierarchy.find(x => x.level === 5);
        if(branchData && branchData.child) args.branch = branchData.child;
      }
    }
    const query = await getTextbooksQuery(args)
    console.log(query);
    return TextbookModel(context).then( (Textbook) => {
      return Textbook.find(query).cache(config.cacheTimeOut.textbook)
    })
  })
}

async function getHierarchyData(context, hierarchyCodes){
  return InstituteHierarchyModel(context).then((InstituteHierarchy) => {
    const query = {
      active: true,
      childCode: {
        $in: hierarchyCodes
      }
    }
    const projection = {
      _id: 0,
      child: 1,
      childCode: 1,
      parentCode: 1,
      levelName: 1
    }
    return InstituteHierarchy.find(query, projection)
  })
}

async function getSubjectData(context, args){
  const findQuery = {
    code: args.subjectCode,
    'refs.class.code': args.classCode,
    active: true
  }  
  return SubjectModel(context).then((Subject) => {
    return Subject.findOne(findQuery);
  })
}

export async function validateTextbook(args, context){
  const query = {
    active: true,
    name: args.name,
    'refs.class.code': args.classCode,
    'refs.subject.code': args.subjectCode,
  }
  return TextbookModel(context).then((Textbook) => {
    return Textbook.findOne(query).then((obj) => {
      if (obj) return true
      return false
    })
  })
}

function validateUrl(value) {
  return true;
  // return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

export async function createTextbook(args, context){
  args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
  args.publisher = args.publisher ? args.publisher.replace(/\s\s+/g, ' ').trim() : ''
  if(args.orientations) {
    const items = []
    args.orientations.forEach(element => {
      if(element) items.push(element)
    });
    if(items.length) args.orientations = items;
    else args.orientations = null;
  }
  if (
    !args.name ||
    !args.classCode ||
    !args.subjectCode
  ) {
    throw new Error('Insufficient data');
  }
  return validateTextbook(args, context).then((isTextbookExist) => {
    if(isTextbookExist) throw new Error('Textbook already exists')
    return Promise.all([
      getHierarchyData(context, [args.classCode]),
      getSubjectData(context, args),
      TextbookModel(context)
    ]).then(([
      hierarchyData,
      subjectData,
      Textbook
    ]) => {
      const classData = hierarchyData.find( x => x.levelName === 'Class' && x.childCode === args.classCode)
      if(
        !classData ||
        !subjectData
      ) {
        throw new Error('Invalid input codes ')
      }
      const obj = {
        name: args.name,
        code: `${Date.now()}${crypto.randomBytes(5).toString('hex')}`,
        imageUrl: args.imageUrl,
        publisher: args.publisher,
        orientations: args.orientations,
        refs: {
          class: {
            name: classData.child,
            code: classData.childCode,
          },
          subject: {
            name: subjectData.subject,
            code: subjectData.code,
          }
        }
      }
      return Textbook.create(obj)
    })
  })
  
}

export async function validateTextbookForUpdate(args, context){
  let query = {
    active: true,
    code: args.code,
  }
  return TextbookModel(context).then((Textbook) => {
    return Textbook.findOne(query).then((obj) => {
      if (!obj) throw new Error('Textbook not found with given code')
      if (args.name){
        query = {
          active: true,
          name: args.name,
          code: { $ne: args.code },
          'refs.class.code': obj.refs.class.code,
          'refs.subject.code': obj.refs.subject.code
        }
        return Textbook.findOne(query).then((doc) => {
          if(doc) throw new Error('Textbook name already exists')
          return Textbook;
        })
      }
      return Textbook;
    })
  })
}


export async function updateTextbook(args, context){
  args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
  args.publisher = args.publisher ? args.publisher.replace(/\s\s+/g, ' ').trim() : ''
  if (
      !args.code ||
     (!args.name && !args.imageUrl && !args.publisher && !args.orientations)
     ){
    throw new Error('Insufficient data')
  }
  if (args.imageUrl && !validateUrl(args.imageUrl)){
    throw new Error('Invalid image url')
  }

  if(args.orientations) {
    const items = []
    args.orientations.forEach(element => {
      if(element) items.push(element)
    });
    if(items.length) args.orientations = items;
    else args.orientations = null;
  }
  
  return validateTextbookForUpdate(args, context).then((Textbook) => { 
    const matchQuery ={
      active: true,
      code: args.code,
    }
    const patch = {}
    if(args.name) patch.name = args.name
    if(args.imageUrl) patch.imageUrl = args.imageUrl
    if(args.publisher) patch.publisher = args.publisher
    if(args.orientations) patch.orientations = args.orientations;
    return Textbook.updateOne(matchQuery, patch).then(() => {
      return Textbook.findOne(matchQuery)
    })
  })
}

export async function deleteTextbook(args, context) {
  if (!args.code) throw new Error('Code is requried')
  return TextbookModel(context).then((Textbook) => {
    const query = { active: true, code: args.code }
    const patch = { active: false}
    return Textbook.findOneAndUpdate(query,patch).then((doc) => {
      if(!doc) throw new Error('Textbook not found with given code')
      return doc
    })
  })
}