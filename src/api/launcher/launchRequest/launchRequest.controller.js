import { config } from '../../../config/environment';

const AWS = require('aws-sdk');

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
