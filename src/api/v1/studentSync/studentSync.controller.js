import { getModel as Student } from '../../settings/student/student.model';
import { getModel as instituteHierarchy } from '../../settings/instituteHierarchy/instituteHierarchy.model';

export function student(req, res) {
  console.log('req', req.body);
  const admissionNo = req && req.body && req.body.admission_no ?
    req.body.admission_no : null;
  const countryName = req && req.body && req.body.country ?
    req.body.country : null;
  const className = req && req.body && req.body.class ? req.body.class : null;
  const stateName = req && req.body && req.body.state ? req.body.state : null;
  const cityName = req && req.body && req.body.city ? req.body.city : null;
  const branchName = req && req.body && req.body.branch ? req.body.branch : null;
  const sectionName = req && req.body && req.body.section ? req.body.section : null;
  const orientation = req && req.body && req.body.orientation ? req.body.orientation : null;
  const maskedContact = req && req.body && req.body.masked_contact ? req.body.masked_contact : null;
  const studentName = req && req.body && req.body.student_name ? req.body.student_name : null;
  const dob = req && req.body && req.body.dob ? req.body.dob : null;
  const fatherName = req && req.body && req.body.father_name ? req.body.father_name : null;
  const gender = req && req.body && req.body.gender ? req.body.gender : null;
  const category = req && req.body && req.body.category ? req.body.category : null;
  const digitalContent = req && req.body && req.body.digital_content ? req.body.digital_content : null;

  if (!admissionNo) {
    res.statusMessage = 'No admission_no in Request Parameter';
    return res.status(404).end();
  }
  if (!countryName) {
    res.statusMessage = 'No country in Request Parameter';
    return res.status(404).end();
  }
  if (!className) {
    res.statusMessage = 'No class in Request Parameter';
    return res.status(404).end();
  }
  if (!stateName) {
    res.statusMessage = 'No state in Request Parameter';
    return res.status(404).end();
  }
  if (!branchName) {
    res.statusMessage = 'No branch in Request Parameter';
    return res.status(404).end();
  }
  if (!sectionName) {
    res.statusMessage = 'No section in Request Parameter';
    return res.status(404).end();
  }
  if (!orientation) {
    res.statusMessage = 'No orientation in Request Parameter';
    return res.status(404).end();
  }
  if (!maskedContact) {
    res.statusMessage = 'No maskedContact in Request Parameter';
    return res.status(404).end();
  }
  if (!studentName) {
    res.statusMessage = 'No studentName in Request Parameter';
    return res.status(404).end();
  }
  if (!digitalContent) {
    res.statusMessage = 'No digital content in Request Parameter';
    return res.status(404).end();
  }
  return Student(req.user_cxt).then(studentModel =>
    studentModel.findOne({ studentId: admissionNo }).then(async () => {
      const hierarchyPath = `${countryName.replace('-', ' ')
      }-${className.replace('-', ' ')
      }-${stateName.replace('-', ' ')
      }-${cityName.replace('-', ' ')
      }-${branchName.replace('-', ' ')
      }-${sectionName.replace('-', ' ')
      }`;
      // console.log('hierarchyPath', hierarchyPath);
      const instituteHierarchyModel = await instituteHierarchy(req.user_cxt);
      instituteHierarchyModel.findOne({ path: hierarchyPath }).then((hierarchyObj) => {
        if (hierarchyObj) {
          const hierarchyLevels = {
            L_1: countryName,
            L_2: className,
            L_3: stateName,
            L_4: cityName,
            L_5: branchName,
            L_6: sectionName,
          };
          const hierarchy = [];
          const { ancestors } = hierarchyObj;
          for (let a = 0; a < ancestors.length; a += 1) {
            const ancestor = ancestors[a];
            const tempHierarchy = {
              child: ancestor.child,
              childCode: ancestor.childCode,
              level: ancestor.level,
            };
            hierarchy.push(tempHierarchy);
          }
          const tempObj = {
            studentId: admissionNo,
            studentName,
            fatherName: fatherName || null,
            dob: dob || null,
            gender: gender || null,
            category: category || null,
            active: digitalContent === 'yes',
            userCreated: true,
            orientation,
            hierarchyLevels,
            hierarchy,
            egnifyId: `${hierarchyPath}_${admissionNo}`,
          };
          // console.log("tempObj", tempObj);
          studentModel.updateOne({ studentId: admissionNo }, tempObj).then(() => {
            console.info(`${admissionNo} has been updated into studentInfo table successfully`);
          });
        }
        // Textbook.updateOne(matchQuery, patch)
      }).catch((err) => {
        console.error(err);
      });
    }).catch((err) => {
      console.error(err);
    }));
}

export default {
  student,
};
