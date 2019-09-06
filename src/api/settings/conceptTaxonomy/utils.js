import request from 'request';

export async  function addContent(content) {
    let options = {};
    if(content["active"]){
        options = {
            method: "POST",
            url: "http://localhost:9200/content/_doc/" + content["_id"],
            json:
            {
                "title": content["name"],
                "type": content["category"],
                "id" : content["_id"]
            }
        }
    }else{
        options = {
            method: "DELETE",
            url: "http://localhost:9200/content/_doc/" + content["_id"]
        }
    }
    fireRequestToElasticSearch(options);
}

export async function updateContent(content) {
    let options ={}
    if(content["active"]){
        options = {
            method: "PUT",
            url: "http://localhost:9200/content/_doc/" + content["_id"],
            json:
            {
                "title": content["name"],
                "type": content["category"],
                "id" : content["_id"]
            }
        }
    }else{
        options = {
            method: "DELETE",
            url: "http://localhost:9200/content/_doc/" + content["_id"]
        }
    }
    fireRequestToElasticSearch(options);
}

export async function addChapter(content) {
    let options = {};
    if (content["active"] && content["levelName"] === "topic") {
        options = {
            method: "POST",
            url: "http://localhost:9200/content/_doc/" + content["_id"],
            json:
            {
                "title": content["child"],
                "type": "chapter",
                "id" : content["_id"]
            }
        }
        request(options, (err, res, body) => {
            console.log(res.statusCode);
        });
    }else{
        options = {
            method: "DELETE",
            url: "http://localhost:9200/content/_doc/" + content["_id"]    
        }
    }
    fireRequestToElasticSearch(options);
}

export async function updateChapter(content) {
    let options = {};
    if (content["active"] && content["levelName"] === "topic") {
        options = {
            method: "PUT",
            url: "http://localhost:9200/content/_doc/" + content["_id"],
            json:
            {
                "title": content["name"],
                "type": content["category"],
                "id" : content["_id"]
            }
        }
    }else{
        options = {
            method: "DELETE",
            url: "http://localhost:9200/content/_doc/" + content["_id"]    
        }
    }
    fireRequestToElasticSearch(options);
}

function fireRequestToElasticSearch(options){
    request(options, (err, res, body) => {
        console.log(res.statusCode);
    });
}

export default {
    updateChapter,
    addChapter,
    updateContent,
    addContent
}