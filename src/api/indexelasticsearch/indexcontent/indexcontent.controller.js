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
        let contents = await contentMappingModel.aggregate([{
            $match: {
                active: true
            }
        }, {
            $lookup: {
                from: "textbooks",
                localField: "refs.textbook.code",
                foreignField: "code",
                as: "textbookInfo"
            }
        }, {
            $unwind: {
                "path": "$textbookInfo",
                "preserveNullAndEmptyArrays": true
            }
        },{
            "$project":{
                "id":"$_id",
                title : "$content.name",
                type : "$content.category",
                textbook : "$textbookInfo.name",
                class : "$textbookInfo.refs.class.name",
                subject : "$textbookInfo.refs.subject.name",
                chapterCode : "$refs.topic.code",
                "_id" : 0
            }
        },{
            $lookup:{
                from : "concepttaxonomies",
                localField : "chapterCode",
                foreignField: "code",
                as : "chapterInfo"
            }
        },{
            $unwind : {
                path : "$chapterInfo",
                "preserveNullAndEmptyArrays": true
            }
        },{
            $project:{
                id : 1,
                title : 1,
                type : 1,
                textbook : 1,
                class : 1,
                subject : 1,
                chapter : "$chapterInfo.child"
            }
        }]);
        for (let i = 0 ; i < contents.length ; i++){
            let option = {
                json: contents[i],
                url : config["elasticSearch"]["url"]+"content/_doc/"+contents[i]["id"],
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