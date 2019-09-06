//Models
import { getModel as contentMapping } from '../../settings/contentMapping/contentMapping.model';
import { getModel as conceptTaxonomy } from '../../settings/conceptTaxonomy/concpetTaxonomy.model';

//Packages
import request from 'request';
const config = require("../../../config/environment")["config"];
export async function indexContent(req, res) {
    try{
        let context = req.user_cxt;
        let contentMappingModel = await contentMapping(context);
        let contents = await contentMappingModel.find().lean().select({content : 1, active:1});
        for (let i = 0 ; i < contents.length ; i++){
            if(contents[i]["active"]){
                let option = {
                    json: {"title" : contents[i]["content"]["name"], "type" : contents[i]["content"]["category"] , "id" : contents[i]["_id"]},
                    url : config["elasticSearch"]["url"]+"content/_doc/"+contents[i]["_id"],
                    method : "POST"
                }
                setTimeout(function(){
                    request(option,(err,response, body) => {
                    })
                },i*10);
            }
        }
        return res.status(200).send("Indexing in Progress");
    }catch(err){
        throw new Error(err);
    }
}

export async function indexChapter(req, res) {
    try{
        let context = req.usr_ctx;
        let ConceptTaxonomyModel = await conceptTaxonomy(context);
        let chapters = await ConceptTaxonomyModel.find({levelName : "topic"}).select({child : 1,active:1});
        for (let i = 0 ; i < chapters.length ; i++){
            if(chapters[i]["active"]){
                let option = {
                    json: {"title" : chapters[i]["name"], type : "chapter" , id : chapters[i]["_id"]},
                    url : config["elasticSearch"]["url"]+"content/_doc/"+contents[i]["_id"],
                    method : "POST"
                }
                setTimeout(function(){
                    request(option,(err,response, body) => {
                    })
                },i*10);
            }
        }
        return res.status(200).send("Indexing In Progress");
    }catch(err){
        throw new Error(err);
    }
}

export default {
    indexChapter,
    indexContent
}