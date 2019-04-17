import { getModel as SubjectModel } from './subject.model';

function getSubjectsQuery(args){
  const query = {}
  if (args.boardCode) query['refs.board.code'] = args.boardCode;
  if (args.classCode) query['refs.class.code'] = args.classCode;
  if (args.subjecttypeCode) query['refs.subjecttype.code'] = args.subjecttypeCode;
  return query
}
export async function getSubjects(args, context){
  const query = getSubjectsQuery(args)
  return SubjectModel(context).then( (Subject) => {
    return Subject.find(query)
  })
}