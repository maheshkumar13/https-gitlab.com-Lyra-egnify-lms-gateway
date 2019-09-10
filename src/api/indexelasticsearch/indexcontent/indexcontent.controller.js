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
        let contents = await contentMappingModel.find({active:true}).lean().select({content : 1});
        for (let i = 0 ; i < contents.length ; i++){
            let option = {
                json: {"title" : contents[i]["content"]["name"], "type" : contents[i]["content"]["category"] , "id" : contents[i]["_id"]},
                url : config["elasticSearch"]["url"]+"content/_doc/"+contents[i]["_id"],
                method : "POST"
            }
            setTimeout(function(){
                request(option,(err,response, body) => {
                    if(!err){
                        console.log(response.statusCode);
                    }
                })
            },i*10);
        }
        return res.status(200).send("Indexing in Progress");
    }catch(err){
        console.log(err);
        return res.status(500).send("Internal server error");
    }
}

export async function indexChapter(req, res) {
    try{
        let context = req.user_cxt;
        let ConceptTaxonomyModel = await conceptTaxonomy(context);
        let chapters = await ConceptTaxonomyModel.find({levelName : "topic",active:true}).select({child : 1,active:1});
        for (let i = 0 ; i < chapters.length ; i++){
            let option = {
                json: {"title" : chapters[i]["child"], type : "chapter" , id : chapters[i]["_id"]},
                url : config["elasticSearch"]["url"]+"content/_doc/"+chapters[i]["_id"],
                method : "POST"
            }
            setTimeout(function(){
                request(option,(err,response, body) => {
                    if(!err){
                        console.log(response.statusCode);
                    }
                })
            },i*10);
        }
        return res.status(200).send("Indexing In Progress");
    }catch(err){
        console.log(err);
        return res.status(500).send("Internal server error");
    }
}

export default {
    indexChapter,
    indexContent
}