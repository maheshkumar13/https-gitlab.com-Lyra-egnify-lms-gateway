import AcademicYear from './academicYear.model';

export function InsertAcadYearRecords(records) {
  return new Promise((resolve, reject) => {
    AcademicYear.create(records)
      .then((docs) => {
        resolve(docs);
      })
      .catch(err => reject(err));
  });
}

export function updateAcadYearRecord(academicYear, updateParamsJson) {
  return new Promise((resolve, reject) => {
    const findQuery = { academicYear };
    AcademicYear.update(findQuery, { $set: updateParamsJson })
      .exec()
      .then((docs) => {
        resolve(docs);
      })
      .catch(err => reject(err));
  });
}

export function getAcadYearRecords(query) {
  return new Promise((resolve, reject) => {
    AcademicYear.find(query)
      .exec()
      .then((docs) => {
        resolve(docs);
      })
      .catch(err => reject(err));
  });
}

export function deleteRecords(query) {
  return new Promise((resolve, reject) => {
    AcademicYear.remove(query)
      .exec()
      .then(doc => resolve(doc))
      .catch(err => reject(err));
  });
}

export default {
  InsertAcadYearRecords,
  updateAcadYearRecord,
  getAcadYearRecords,
  deleteRecords,
};
