import { getModel as MarkingScheme } from './marking.scheme.model';

export async function listMarkingSchema(args, ctx){
    try{
        let query = {}
        if(args.id){
            query["_id"] = args.id;
        }
        const MarkingSchema = await MarkingScheme(ctx);
        return await MarkingSchema.find(query).lean()
    }catch (err){
        throw err;
    }
}