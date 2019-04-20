import { getModel as TextbookModel } from './textbook.model';
import { getModel as InstituteHierarchyModel} from '../instituteHierarchy/instituteHierarchy.model'
import { getModel as SubjectModel } from '../subject/subject.model'

const crypto = require('crypto')

function getTextbooksQuery(args){
  const query = { active: true }
  if (args.boardCode) query['refs.board.code'] = args.boardCode;
  if (args.classCode) query['refs.class.code'] = args.classCode;
  if (args.programCode) query['refs.program.code'] = args.programCode;
  if (args.subjectCode) query['refs.subject.code'] = args.subjectCode;
  return query
}
export async function getTextbooks(args, context){
  const query = getTextbooksQuery(args)
  return TextbookModel(context).then( (Textbook) => {
    return Textbook.find(query)
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
    'refs.board.code': args.boardCode,
    'refs.class.code': args.classCode,
    active: true
  }
  console.log('findQuery', findQuery);
  
  return SubjectModel(context).then((Subject) => {
    return Subject.findOne(findQuery);
  })
}

export async function validateTextbook(args, context){
  const query = {
    active: true,
    name: args.name,
    'refs.board.code': args.boardCode,
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
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

export async function createTextbook(args, context){
  args.name = args.name ? args.name.replace(/\s\s+/g, ' ').trim() : ''
  if (
    !args.name ||
    !args.boardCode ||
    !args.classCode ||
    !args.subjectCode
  ) {
    throw new Error('Insufficient data');
  }
  return validateTextbook(args, context).then((isTextbookExist) => {
    if(isTextbookExist) throw new Error('Textbook already exists')
    return Promise.all([
      getHierarchyData(context, [args.boardCode, args.classCode]),
      getSubjectData(context, args),
      TextbookModel(context)
    ]).then(([
      hierarchyData,
      subjectData,
      Textbook
    ]) => {
      const boardData = hierarchyData.find( x => x.levelName === 'Board' && x.childCode === args.boardCode)
      const classData = hierarchyData.find( x => x.levelName === 'Class' && x.childCode === args.classCode)
      console.log('boardData', boardData, 'classData',classData);
      if(
        !boardData ||
        !classData ||
        !subjectData
      ) {
        throw new Error('Invalid input codes ')
      }
      if (boardData.childCode !== classData.parentCode) {
        throw new Error('Invalid board class mapping ')
      }
      const obj = {
        name: args.name,
        code: `${Date.now()}${crypto.randomBytes(5).toString('hex')}`,
        imageUrl: args.imageUrl,
        refs: {
          board: {
            name: boardData.child,
            code: boardData.childCode,
          },
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
          'refs.board.code': obj.refs.board.code,
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
  if (
      !args.code ||
     (!args.name && !args.imageUrl)
     ){
    throw new Error('Insufficient data')
  }
  if (args.imageUrl && !validateUrl(args.imageUrl)){
    throw new Error('Invalid image url')
  }
  return validateTextbookForUpdate(args, context).then((Textbook) => { 
    const matchQuery ={
      active: true,
      code: args.code,
    }
    const patch = {}
    if(args.name) patch.name = args.name
    if(args.imageUrl) patch.imageUrl = args.imageUrl
    return Textbook.findOneAndUpdate(matchQuery, patch).then((doc) => {
      if(args.name) doc.name = args.name
      if(args.imageUrl) doc.imageUrl = args.imageUrl
      return doc
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