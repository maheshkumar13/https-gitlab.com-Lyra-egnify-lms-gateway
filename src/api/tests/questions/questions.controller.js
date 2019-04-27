import { getModel as QuestionModel } from './questions.model';

function getQuestionsQuery(args){
  const query = {}
  if (args.questionPaperId) query['questionPaperId'] = args.questionPaperId;
  return query
}
export async function getQuestions(args, context){
  if(!args.questionPaperId) throw new Error('questionPaperId required')
  const query = getQuestionsQuery(args)
  return QuestionModel(context).then( (Question) => {
    return Question.find(query)
  })
}