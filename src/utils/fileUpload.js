/**
   @author Rahul Islam
   @date    XX/XX/XXXX
   @version 1.0.0
*/

/* eslint consistent-return: 0 */
import {
  config
} from '../config/environment';

const AWS = require('aws-sdk');
const Storage = require('@google-cloud/storage');

const {
  CLOUD_BUCKET
} = config;

const storage = Storage({
  projectId: config.GCLOUD_PROJECT,
});
const bucket = storage.bucket(CLOUD_BUCKET);

// const getPreSignedUrl = '../../launcher/launchRequest.controller';
// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
// [START public_url]
function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}
// [END public_url]

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
// [START process]
function sendUploadToGCS(req, res, next) {
  if (!req.file) {
    return next();
  }

  const gcsname = Date.now() + req.file.originalname;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      next();
    });
  });

  stream.end(req.file.buffer);
}
// [END process]

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory.
// This makes it straightforward to upload to Cloud Storage.
// [START mult50
const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // no larger than 5mb
  },
});
const multerNameAsPath = Multer({ // in this function the file name is
  // stored as the absolute path of the file
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // no larger than 50mb
  },
  preservePath: 1,
});

// [END multer]

function uploadToGCS(inputFile) {
  return new Promise((resolve, reject) => {
    if (!inputFile) {
      return false;
    }

    // console.log('file is', inputFile);
    const gcsname = Date.now() + inputFile.originalname;
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
      metadata: {
        contentType: inputFile.mimetype,
      },
    });
    let fileUrl = '';
    stream.on('error', (err) => {
      fileUrl = err.message;
      reject(err.message);
    });

    stream.on('finish', () => {
      fileUrl = gcsname;
      file.makePublic().then(() => {
        fileUrl = getPublicUrl(gcsname);
        resolve(fileUrl);
      });
    });

    stream.end(inputFile.buffer);
  });
}

const AWSPublicFileUpload = (req, res) => {
  if (!(req && req.file)) {
    res.status(404).send('Please upload a file');
  }
  AWS.config.update({
    accessKeyId: config.AWS_S3_KEY,
    secretAccessKey: config.AWS_S3_SECRET,
  });
  const buketName = config.AWS_PUBLIC_BUCKET;
  const folderName = config.AWS_PUBLIC_BUCKET_FOLDER;
  const s3 = new AWS.S3();
  const date = new Date();
  let originalname = '';
  if (req && req.file && req.file.originalname) {
    originalname = `${date}_${req.file.originalname}`;
  }
  const Key = `${folderName}/${originalname}`; // upload to s3 folder "id" with filename === fn
  const params = {
    Key,
    Bucket: buketName, // set somewhere
    Body: req.file.buffer, // req is a stream
    ContentType: req.file.mimetype,
    ACL: 'public-read', // making the file public
  };
  // console.log(req.file.buffer.byteLength);
  s3.upload(params).on('httpUploadProgress', (progress) => {
    console.info('Uploaded Percentage', `${Math.floor((progress.loaded * 100) / progress.total)}%`);
  }).send((err, data) => {
    if (err) {
      res.send(`Error Uploading Data: ${JSON.stringify(err)}\n${JSON.stringify(err.stack)}`);
    }
    if (data) {
      res.send({
        fileUrl: data.Location
      });
      // console.log("Uploaded in:", data.Location);
    }
  });
};

const AWSPrivateFileUpload = (req, res) => {
  if (!(req && req.files)) {
    res.status(404).send('Please upload files');
  }
  AWS.config.update({
    accessKeyId: config.AWS_S3_KEY,
    secretAccessKey: config.AWS_S3_SECRET,
  });
  const folderName = config.AWS_PRIVATE_BUCKET_FOLDER;
  const buketName = config.AWS_PRIVATE_BUCKET;
  const date = new Date();

  // console.log('req', req.files);
  const s3 = new AWS.S3();
  const {
    files
  } = req;
  const ResponseData = [];
  files.forEach((file) => {
    const originalname = `${date}_${file.originalname}`;
    const fileSize = file.buffer.byteLength;
    const Key = `${folderName}/${originalname}`; // upload to s3 folder "id" with filename === fn
    const params = {
      Key,
      Bucket: buketName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    s3.upload(params).on('httpUploadProgress', (progress) => {
      console.info('Uploaded Percentage', `${Math.floor((progress.loaded * 100) / progress.total)}%`);
    }).send((err, data) => {
      if (err) {
        res.send(`Error Uploading Data: ${JSON.stringify(err)}\n${JSON.stringify(err.stack)}`);
      }
      if (data) {
        const tempUrl = s3.getSignedUrl('getObject', {
          Bucket: buketName,
          Key: data.key,
          Expires: 120
        });
        const tempData = {
          key: data.key,
          name: file.originalname,
          fileSize,
          fileType: file.mimetype,
          tempUrl
        };
        ResponseData.push(tempData);
        if (ResponseData.length === files.length) {
          res.json({
            error: false,
            Message: 'File Uploaded    SuceesFully',
            Data: ResponseData
          });
        }
      }
    });
  });
};

const AWSHTMLUpload = (req, res) => {
  if (!(req && req.files)) {
    res.status(404).send('Please upload files');
  }
  AWS.config.update({
    accessKeyId: config.AWS_S3_KEY,
    secretAccessKey: config.AWS_S3_SECRET,
  });
  const buketName = config.AWS_PUBLIC_BUCKET;

  // console.log('req', req.files);
  const s3 = new AWS.S3();
  const {
    files
  } = req;
  // const ResponseData = [];
  const promisesArray = [];
  let folderName = '';
  let overallFileSize = 0;
  files.forEach((file) => {
    const fileSize = file.buffer.byteLength;
    overallFileSize += fileSize;
    const originalnameArray = file.originalname.split('/');
    folderName = originalnameArray[0];
    const Key = `htmlContentSamples/${file.originalname}`; // upload to s3 folder "id" with filename === Key
    const params = {
      Key,
      Bucket: buketName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };
    promisesArray.push(new Promise(((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })));
  });
  Promise.all(promisesArray).then((dataValues) => {
    const indexObj = dataValues.find(x => x.key === `htmlContentSamples/${folderName}/index.html`);
    const finalObj = {
      key: indexObj.key,
      name: folderName,
      fileType: 'HTML',
      Location: indexObj.Location,
      Key: indexObj.Key,
      fileSize: overallFileSize,
    };
    return res.json({
      error: false,
      Message: 'File Uploaded    SuceesFully',
      Data: finalObj
    });
  });
};

const s3GetFileData = async (key) => {
  return new Promise(function (resolve, reject) {
    AWS.config.update({
      accessKeyId: config.AWS_S3_KEY,
      secretAccessKey: config.AWS_S3_SECRET,
    });
    const s3 = new AWS.S3();
    const options = {
      Key : key,
      Bucket:config.AWS_PRIVATE_BUCKET
    }
    s3.getObject(options, function (err, data) {
      if (err) {
        reject(err);
      } else {
         resolve({
          "size": data.ContentLength,
          "data": data.Body
        });
      }
    });
  })
}

module.exports = {
  getPublicUrl,
  sendUploadToGCS,
  uploadToGCS,
  multer,
  AWSPublicFileUpload,
  AWSPrivateFileUpload,
  AWSHTMLUpload,
  multerNameAsPath,
  s3GetFileData
};
