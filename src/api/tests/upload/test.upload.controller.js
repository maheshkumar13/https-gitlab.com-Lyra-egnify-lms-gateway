import { getModel as Tests } from './test.upload.model';
import { getModel as Questions } from '../questions/questions.model';
import { getModel as MarkingScheme } from '../markingScheme/marking.scheme.model';

function queryForListTest (args){
    let query = {find : {}, search : {} , sort : {"test.date" : -1}}
    if(args.class_code){
        query["find"]["mapping.class.code"] = args.class_code;
    }
    if(args.textbook_code){
        query["find"]["mapping.textbook.code"] = args.textbook_code;
    }
    if(args.subject_code){
        query["find"]["mapping.subject.code"] = args.subject_code;
    }

    if(args.search_query){
        query["search"]["value"] = args.search_query;
        query["search"]["fields"] = ["mapping.subject.name","test.name","mapping.textbook.name","mapping.class.name"]
    }
    
    if(args.sort_order === "asc"){
        query["sort"] = {
            "test.date" : 1
        }
    }
    
    return query;

}

export async function listTest(args, ctx){
    try{
        console.log(args);
        const queries = queryForListTest(args);
        const TestSchema = await Tests(ctx);
        return await TestSchema.dataTables({
            limit: 0,
            skip: 0,
            find : queries.find,
            search: queries.search,
            sort: queries.sort,
          });
    }catch(err){
        throw err;
    }
}

export async function parseAndValidateTest (args, ctx){
    
}

export async function publishTest(args , ctx){
    try{
        const TestSchema = await Tests(ctx);
        let result = await TestSchema.findOneAndUpdate({_id : args.id},{$set : {active : true}},{new : true});
        if(result){
            return {"message" : "Test published successfully."};
        }else{
            return {"message" : "No such test availbale."};
        }
    }catch(err){
        throw err;
    }
}
