
import { getModel as LiveClassModel } from './class.model';


export async function createClass(req,res){
    try {
        const LiveClassSchema = await LiveClassModel(req.user_cxt)
        await LiveClassSchema.insertMany(req.body);
        return res.status(200).end('Class created successfully!')
    } catch (error) {
        return res.status(500).end(error.message)
    }   
}

export async function getClass(req,res){
    try {
        const LiveClassSchema = await LiveClassModel(req.user_cxt)
        const data = await LiveClassSchema.findOne({_id:req.params.classId});
        return res.status(200).send(data)
    } catch (error) {
        return res.status(500).end(error.message)
    }
}
export async function getClassesByStatus(req,res){
    try {
        const LiveClassSchema = await LiveClassModel(req.user_cxt)
        const {status,branch,section,orientation} = req.query;
        const query ={};
        if (status){
            if(status == 'inprogress'){
                query['startTime'] = {"$lte":new Date()}
                query['endTime'] = {"$gte":new Date()}
            }else if(status == 'upcoming'){
                query['startTime'] = {"$gte":new Date()}
            }else if(status == 'completed'){
                query['endTime'] = {"$lte":new Date()}
            }
        }
        if(branch){
            query['branch'] = {"$in":branch.split(",")}
        }
        if(section){
            query['section'] = {"$in":section.split(",")}
        }
        if(orientation){
            query['orientation'] = {"$in":orientation.split(",")}
        }
        const data = await LiveClassSchema.find(query);
        return res.status(200).send(data)
    } catch (error) {
        return res.status(500).end(error.message)
    }
}
