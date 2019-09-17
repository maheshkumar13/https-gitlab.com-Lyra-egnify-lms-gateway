import {
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
    GraphQLList as List
} from 'graphql';
const config = require("../../../config/environment")["config"];
import request from 'request';
import GraphQLJSON from 'graphql-type-json';
// const config = 
import { SearchResultType } from './search.type';

export const autoComplete = {
    args: {
        q: { type: NonNull(StringType), description: 'Search String' },
    },
    type: GraphQLJSON,
    resolve: async (context, args) => {
        try {
            const q = args.q;
            let options = {
                method: "POST",
                url: config["elasticSearch"]["url"]+"content/_search",
                json: {
                    "suggest": {
                        "_doc": {
                            "prefix": q,
                            "completion": {
                                "field": "title.completion"
                            }
                        }
                    }
                }
            }
            let res = await requestForResult(options);
            let result = res["suggest"]["_doc"][0]["options"].map((search_result) => { return { title: search_result.text, id: search_result["_id"], type: search_result["_source"]["type"],textbook : search_result["_source"]["textbook"] ,class : search_result["_source"]["class"] ,subject : search_result["_source"]["subject"],chapter :search_result["_source"]["chapter"] } })
            // console.log(JSON.stringify(res));
            return result;
        } catch (err) {
            throw new Error(err);
        }
    }
};

export const searchResult = {
    args: {
        q: { type: NonNull(StringType), description: 'Search String' },
    },
    type: GraphQLJSON,
    resolve: async (context, args) => {
        try {
            let q = args.q;
            q = q.split(" ").map(word => '.*' + word + '.*').join(" ");
            let options = {
                method: "POST",
                url: config["elasticSearch"]["url"]+"content/_search",
                json:{
                    "query": {
                        "match": {
                            "title": q
                        }
                    }
                }
            }
            let res = await requestForResult(options);
            let result = res["hits"]["hits"].map((search_result) => { return { textbook : search_result["_source"].textbook, chapter:search_result["_source"].chapter,subject :search_result["_source"].subject,class: search_result["_source"].class,  title: search_result["_source"].title, id: search_result["_id"], type: search_result["_source"]["type"] } })
            return result;
        } catch (err) {
            throw new Error(err);
        }
    }
}

// "query": {
//     "regexp": {
//         "title": {
//             "value": q,
//             "flags" : "ALL",
//             "max_determinized_states": 10000,
//             "rewrite": "constant_score"
//         }
//     }
// }


// {
//     "query": {
//         "match": {
//             "title": q
//         }
//     }
// }

function requestForResult(options) {
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

export default {
    autoComplete,
    searchResult
};