import { getModel as SubjectModel } from './subject.model';
import { getModel as InstituteHierarchyModel} from '../instituteHierarchy/instituteHierarchy.model'

function getSubjectsQuery(args){
  const query = { active: true }
  if (args.boardCode) query['refs.board.code'] = args.boardCode;
  if (args.classCode) query['refs.class.code'] = args.classCode;
  return query
}
export async function getSubjects(args, context){
  const query = getSubjectsQuery(args)
  return SubjectModel(context).then( (Subject) => {
    return Subject.find(query)
  })
}

function getObjectCombinations(boards, classes) {
  const data = []
  boards.forEach(boardCode => {
    classes.forEach(classCode => {
      const temp = {
        boardCode,
        classCode,
      }
      data.push(temp)
    })
  })
  return data;
}

async function validateAndGetHierarchyData(context, hierarchyCodes){
  console.log(hierarchyCodes)
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
      levelName: 1
    }
    return InstituteHierarchy.find(query, projection)
  })
}

async function insertSubjectsDataByfind(Subject, data) {
  const finalData = []
  return Promise.all( await data.map((obj) => {
      return Subject.findOne(obj.findQuery).then((doc) => {
          if(!doc) finalData.push(obj.objData)
      })
  })).then(() => {
    console.log('finalData', finalData)
    if(!finalData.length) return true
    return Subject.insertMany(finalData).then(() => {
      return true
    }).catch((err) => {
      console.error(err)
      throw new Error('Something went wrong!')
    })
  })
}

export async function createSubject(args, context) {
  console.log(args)
  const subject = args.subject ? args.subject.replace(/\s\s+/g, ' ').trim() : ''
  if(
     !subject || 
     !(args.boards && args.boards.length) || 
     !(args.classes && args.classes.length)
    ){
      throw new Error('subject, boards, classess data required')
    }
    let hierarchyCodes = []
    hierarchyCodes = hierarchyCodes.concat(args.boards)
    hierarchyCodes = hierarchyCodes.concat(args.classes)
    return Promise.all([
      validateAndGetHierarchyData(context, hierarchyCodes),
      SubjectModel(context)
    ]).then(([hierarchyData, Subject]) => {
      const objectCombs = getObjectCombinations(args.boards, args.classes)
      console.log('objectCombs', objectCombs)
      const data = []
      objectCombs.map(obj => {
          const boardData = hierarchyData.find( x => x.levelName === 'Board' && x.childCode === obj.boardCode)
          const classData = hierarchyData.find( x => x.levelName === 'Class' && x.childCode === obj.classCode)
          if(!boardData || !classData) throw new Error('Invalid childCodes')
          const findQuery = {
            subject,
            'refs.board.code': boardData.childCode,
            'refs.class.code': classData.childCode,
            'refs.subjecttype.name': 'Scholastics',
            active: true
          }
          const objData = {
            subject,
            refs: {
              'board': {
                'name': boardData.child,
                'code': boardData.childCode
              },
              'class': {
                'name': classData.child,
                'code': classData.childCode
              },
              'subjecttype': {
                'name': 'Scholastics',
                'code': '',
              }
            }
          }
          data.push({
            findQuery,
            objData
          })    
      })
      return insertSubjectsDataByfind(Subject, data).then(() => {
        return 'Data inserted successfully'
      }).catch((err) => {
        console.error(err)
        throw new Error('Could not insert data')
      })

    }).catch((err) => {
      console.log(err)
      throw new Error('Could not insert data')
    })     
}