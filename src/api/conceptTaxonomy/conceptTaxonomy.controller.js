// import fetch from 'universal-fetch';
// import stream from 'stream';
//
// const { Duplex } = stream;

// function bufferToStream(buffer) {
//   const duplexStream = new Duplex();
//   duplexStream.push(buffer);
//   duplexStream.push(null);
//   return duplexStream;
// }


// export function generateTaxonomyFromCSV(req, res) {
//   // const taxonomyFile = req.files[0];
//   const url = 'http://localhost:5001/api/conceptTaxonomy/get/conceptTaxonomyfromCSV';

// formData.append('files', {
//   value: bufferToStream(taxonomyFile.buffer),
//   options: {
//     contentType: taxonomyFile.mimetype,
//     filename: taxonomyFile.originalname,
//     knownLength: taxonomyFile.size,
//     size: taxonomyFile.size,
//   },
// });
// formData.append('subjectDetails', req.body.subjectDetails);
// formData.append('levelCode', req.body.levelCode);
// const formData = {
//   files: {
//     value: bufferToStream(taxonomyFile.buffer),
//     options: {
//       contentType: taxonomyFile.mimetype,
//       filename: taxonomyFile.originalname,
//       knownLength: taxonomyFile.size,
//       size: taxonomyFile.size,
//     },
//   },
//   subjectDetails: req.body.subjectDetails,
//   levelCode: req.body.levelCode,
// };
// console.error(formData);
//
//   fetch(url, {
//     method: 'POST',
//     body: formData,
//     // headers: { 'Content-Type': 'multipart/form-data' },
//   })
//     .then(response => response.json())
//     .then((json) => {
//       console.error(json);
//       res.status(200).json(json);
//     });
// }
//
// export default { generateTaxonomyFromCSV };
