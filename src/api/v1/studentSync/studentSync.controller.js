import { getModel as StudentModel } from '../../settings/student/student.model';
import { getModel as InstituteHierarchyModel } from '../../settings/instituteHierarchy/instituteHierarchy.model';
import { config } from '../../../config/environment';

import fetch from '../../../utils/fetchSso';


async function insertStudent(context, obj) {
  return StudentModel(context).then((Student) => {
    const query = { studentId: obj.studentId };
    return Student.updateOne(query, { $set: obj }, { upsert: true })
      .then(() => true)
      .catch((err) => {
        console.error(err);
        return false;
      });
  });
}

async function createUserForStudent(context, obj) {
  const url = `${config.services.sso}/api/v1/users/create/studentUser`;
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({ studentData: obj }),
    headers: { 'Content-Type': 'application/json' },//eslint-disable-line
  }, context).then((response) => {
    if (response.status >= 400) {
      return new Error(response.statusText);
    }
    return response.json().then(json => json.status);
  });
}

export function student(req, res) {
  const args = req.body;
  if (!args.admission_no) {
    res.statusMessage = 'No admission_no in request body';
    return res.status(404).end();
  }
  if (!args.country) {
    res.statusMessage = 'No country in request body';
    return res.status(404).end();
  }
  if (!args.class) {
    res.statusMessage = 'No class in request body';
    return res.status(404).end();
  }
  if (!args.state) {
    res.statusMessage = 'No state in request body';
    return res.status(404).end();
  }
  if (!args.city) {
    res.statusMessage = 'No state in request body';
    return res.status(404).end();
  }
  if (!args.branch) {
    res.statusMessage = 'No branch in request body';
    return res.status(404).end();
  }
  if (!args.section) {
    res.statusMessage = 'No section in request body';
    return res.status(404).end();
  }
  if (!args.orientation) {
    res.statusMessage = 'No orientation in request body';
    return res.status(404).end();
  }
  if (!args.masked_contact) {
    res.statusMessage = 'No masked_contact in request body';
    return res.status(404).end();
  }
  if (!args.student_name) {
    res.statusMessage = 'No student_name in request body';
    return res.status(404).end();
  }
  if (!args.digital_content) {
    res.statusMessage = 'No digital_contentt in request body';
    return res.status(404).end();
  }

  // eslint-disable-next-line no-mixed-operators
  if (args.gender && (args.gender !== 'M' && args.gender !== 'F' && args.gender !== 'O')) {
    res.statusMessage = 'Invalid Gender, accepts M/F/O only';
    return res.status(404).end();
  }

  args.country = args.country.replace('-', ' ');
  args.class = args.class.replace('-', ' ');
  args.state = args.state.replace('-', ' ');
  args.city = args.city.replace('-', ' ');
  args.branch = args.branch.replace('-', ' ');
  args.section = args.section.replace('-', ' ');
  args.digital_content = args.digital_content.toLowerCase().trim();

  return InstituteHierarchyModel(req.user_cxt).then((InstituteHierarchy) => {
    let hierarchyPath = `${args.country}-${args.class}-${args.state}-${args.city}-${args.branch}-${args.section}`.toLowerCase();
    const checkHierarhcyQuery = {
      lowerPathId: hierarchyPath, //{ $regex: hierarchyPath, $options: 'i' },
    };
    return InstituteHierarchy.findOne(checkHierarhcyQuery).then((hierarchyObj) => {
      if (!hierarchyObj) {
        res.statusMessage = 'Requested student hierarchy not found';
        return res.status(404).end();
      }
      const { pathId } = hierarchyObj;
      if (!pathId) {
        res.statusMessage = 'Something went wrong!';
        return res.status(404).end();
      }

      const pathArray = pathId.split('-');

      args.country = pathArray[0]; // eslint-disable-line
      args.class = pathArray[1]; // eslint-disable-line
      args.state = pathArray[2]; // eslint-disable-line
      args.city = pathArray[3]; // eslint-disable-line
      args.branch = pathArray[4]; // eslint-disable-line
      args.section = pathArray[5]; // eslint-disable-line

      const hierarchyLevels = {
        L_1: args.country,
        L_2: args.class,
        L_3: args.state,
        L_4: args.city,
        L_5: args.branch,
        L_6: args.section,
      };
      const hierarchy = [];
      const { anscetors } = hierarchyObj;
      for (let a = 0; a < anscetors.length; a += 1) {
        const ancestor = anscetors[a];
        const tempHierarchy = {
          child: ancestor.child,
          childCode: ancestor.childCode,
          level: ancestor.level,
        };
        hierarchy.push(tempHierarchy);
      }
      hierarchy.push({
        child: hierarchyObj.child,
        childCode: hierarchyObj.childCode,
        level: hierarchyObj.level,
      });
      const tempObj = {
        studentId: args.admission_no,
        studentName: args.student_name,
        fatherName: args.father_name || null,
        dob: args.dob || null,
        gender: args.gender || null,
        category: args.category || null,
        active: args.digital_content === 'yes',
        prepSkill: args.prep_skill === 'yes',
        userCreated: true,
        orientation: args.orientation,
        hierarchyLevels,
        hierarchy,
        egnifyId: `${hierarchyObj.childCode}_${args.admission_no}`,
        phone: args.masked_contact,
      };
      return Promise.all([
        insertStudent(req.user_cxt, tempObj),
        createUserForStudent(req.user_cxt, tempObj),
      ]).then(([insertion, userCreation]) => {
        if (insertion === true && userCreation === true) {
          return res.send(tempObj);
        }
        res.statusMessage = `Student creation ${insertion}, User creation ${userCreation}`;
        return res.status(404).end();
      }).catch((err) => {
        console.info(err);
      });
    });
  });
}

export default {
  student,
};
