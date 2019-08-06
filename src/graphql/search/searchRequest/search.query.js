import {
    GraphQLNonNull as NonNull,
    GraphQLString as StringType,
    GraphQLList as List
  } from 'graphql';

  import request from 'request';
  import GraphQLJSON from 'graphql-type-json';

//   import { SearchResultType } from './search.type';

  export const SearchResult = {
    args: {
      q: { type: NonNull(StringType), description: 'Search String' },
    },
    type: GraphQLJSON,
    resolve: async (context , args) => {
        const q = args.q;
        let options = {
            method : "POST",
            url : "http://localhost:9200/content/_search",
            json : {
                "suggest" : {
                    "_doc":{
                        "prefix" : q,
                        "completion" : {
                            "field" : "title.completion"
                        }	
                    }
                }
            }
        }
        try{
            let res = await requestForResult(options);
            let result = res["suggest"]["_doc"][0]["options"].map((search_result) => {return {title :  search_result.text}})
            console.log(result);
            return result;
        }catch(err){
            throw new Error(err);
        }
    }
  };

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
    SearchResult
  };