import { config } from '../../../config/environment';

const AWS = require('aws-sdk');
const _ = require('lodash');

AWS.config.update({
  signatureVersion: 'v4',
  accessKeyId: config.AWS_S3_KEY,
  secretAccessKey: config.AWS_S3_SECRET,
  region: config.AWS_S3_REGION,
});

const s3 = new AWS.S3();

async function getUrl(params) {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (url) resolve(url);
    });
  });
}

export async function getPreSignedUrl(args, context) {
  let bucketName = config.AWS_PRIVATE_BUCKET;
  const extnameArray = args.key.split('.');
  const extname = extnameArray[extnameArray.length-1].toLowerCase();
  if (extname === 'html' || extname === 'htm' ) bucketName = config.AWS_PUBLIC_BUCKET;
  const params = {
    Bucket: bucketName,
    Key: args.key,
    Expires: 60 * 5, // 5 minutes
  };
  return getUrl(params).then(url => ({
    key: params.Key,
    preSignedUrl: url,
    expires: params.Expires,
  }));
}
async function listAllKeys(params, resp) {
  const data = await s3.listObjectsV2(params).promise();
  resp.CommonPrefixes = resp.CommonPrefixes.concat(data.CommonPrefixes);
  resp.Contents = resp.Contents.concat(data.Contents);
  if (data.IsTruncated) {
      params.ContinuationToken = data.NextContinuationToken;
      return listAllKeys(params, resp);
  }
}

export async function getS3FileSystem(args) {
  if(!args.key) args.key = '';
  let bucket = config.AWS_PRIVATE_BUCKET;
  if(args.html === true) bucket = config.AWS_PUBLIC_BUCKET

  const params = {
    Bucket: bucket,
    Prefix: args.key,
    Delimiter: '/',
  }
  const resp = {
    CommonPrefixes: [],
    Contents: []
  }
  await listAllKeys(params, resp);
  const data = [];
  if(resp.CommonPrefixes && resp.CommonPrefixes.length){
    resp.CommonPrefixes.forEach(x => {
      const temp = {};
      const fileNamesArray = x.Prefix.split('/');
      temp.fileName = fileNamesArray[fileNamesArray.length-2];
      temp.key = x.Prefix;
      temp.folder = true;
          data.push(temp);
        })
      }
      if(resp.Contents && resp.Contents.length){
      resp.Contents.forEach(x => {
        const temp = {};
        const fileNamesArray = x.Key.split('/');
        temp.fileName = fileNamesArray[fileNamesArray.length-1];
        temp.key = x.Key;
        temp.lastModified = x.LastModified;
        temp.size = x.Size;
        temp.folder = false;
        data.push(temp);
      })
    }
    return data
}

export async function getSignedUrlForUpload(args, context) {

  const FILES_LIMIT = 10000;
  const TOTAL_SIZE_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB
  const Expires = 24 * 60 * 60; // 24 hrs
  if(args.data.length > FILES_LIMIT) throw new Error('Number of files limit exceeded'); 
  const totalSize = _.sum(args.data.map(x => x.size));
  if(totalSize > TOTAL_SIZE_LIMIT) throw new Error('Data size limit exceeded');
  
  let bucket = config.AWS_PRIVATE_BUCKET;
  if(args.html === true) bucket = config.AWS_PUBLIC_BUCKET
  const params = {
    Bucket: bucket,
    Expires,
  };
  args.data.forEach(x => {
    params.Key = x.key;
    if(x.contentType) params.ContentType = x.contentType;
    else delete params.ContentType;
    x.uploadUrl = s3.getSignedUrl('putObject', params);
  })
  return args.data;
}

export async function checkIfFileOrFolderExists(args, context){
  const params = {
    Bucket: args.html === true ? config.AWS_PUBLIC_BUCKET : config.AWS_PRIVATE_BUCKET,
    Prefix: args.key.slice(-1) === '/' ? args.key = args.key.substring(0, args.key.length - 1) : args.key,
    Delimiter: '/',
  }
  return s3.listObjectsV2(params)
    .promise()
    .then(data => {
      if (args.folder === true){
        if(data && data.CommonPrefixes && data.CommonPrefixes.length) return { found: true }
        return { found: false }
      }
      if(data && data.Contents && data.Contents.length) return { found: true }
      return { found: false }
    })
    .catch(err => {
      console.error(err);
      throw new Error('Something went wrong!');
    })
  
}