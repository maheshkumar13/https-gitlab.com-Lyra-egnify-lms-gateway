/**
 *@description
 *    This File contains the Mongoose Schema defined for Tests
 * @Author :
 *   Mohit Agarwal
 * @date
 *    23/08/2019
 */
import mongoose from 'mongoose';
import {
  getDB
} from '../../../db';
const Schema = mongoose.Schema;
const dataTables = require('mongoose-datatables');

const TestInfo = new mongoose.Schema({
  name: {
    type: String,
  },
  startTime: {
    type: Date,
    default: Date.now()
  },
  endTime: {
    type: Date,
    default: Date.now()
  },
  date: {
    type: Date,
    default: Date.now()
  },
  duration: {
    type: Number,
    default: null
  },
  questionPaperId: {
    type: String,
    default: null
  }
});

const TestMapping = new mongoose.Schema({
  class: {
    code: {
        type: String,
        index: true
      },
      name: {
        type: String,
        index: true
      }
  },
  subject: {
    code: {
      type: String,
      index: true
    },
    name: {
      type: String,
      index: true
    }
  },
  textbook: {
    code: {
      type: String,
      index: true
    },
    name: {
      type: String,
      index: true
    }
  },
  chapter: {
    code: {
      type: String,
      index: true
    },
    name: {
      type: String,
      index: true
    }
  }
})

const TestSchema = new mongoose.Schema({
  mapping: {
    type: TestMapping
  },
  accessTag: {
    type: Object,
    default: {
      "hierarchy": [],
      "student": []
    }
  },
  testType: {
    type: Schema.Types.Mixed,
    default: {
      "name": "Textbook Test",
      "patternCode": "TT",
      "code": "TT00001",
      "description": "Textbook based tests"
    }
  },
  date: {
    type: Date,
    default: Date.now()
  },
  startTime: {
    type: Date,
    default: Date.now()
  },
  questionTypes: {
    type: Array,
    default: []
  },
  subjectsOrdered: {
    type: Boolean,
    default: false
  },
  questionPaperUrl: {
    type: String,
    default: null
  },
  questionPaperId: {
    type: String,
    default: null
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  studentsUploaded: {
    type: Boolean,
    default: null
  },
  resultsUploaded: {
    type: Boolean,
    default: 0
  },
  resultsUploadedPercentage: {
    type: Number,
    default: 0
  },
  stepsCompleted: {
    type: Number,
    default: 0
  },
  totalSteps: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: null
  },
  testStudentSnapshotStatus: {
    type: Boolean,
    default: null
  },
  otpSyncStatus: {
    type: Object,
    default: {}
  },
  testLink: {
    type: String,
    default: null
  },
  modeOfConduct: {
    type: String,
    default: "online"
  },
  testId: {
    type: String,
    default: null
  },
  academicYear: {
    type: String,
    default: null
  },
  testName: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: null
  },
  subjects: {
    type: Array,
    default: [{
      "totalQuestions": null,
      "qmapCompletion": null,
      "code": null,
      "parentCode": null,
      "subject": null,
      "subjectCode": null
    }]
  },
  selectedHierarchy: {
    type: Object,
    default: {}
  },
  hierarchyTag: {
    type: String,
    default: null
  },
  test: {
    type: TestInfo
  },
  markingScheme: {
    type: Schema.Types.Mixed,
    default: {
      "totalQuestions": null,
      "totalMarks": null,
      "subjects": [{
        "tieBreaker": 1,
        "start": 1,
        "end": null,
        "subject": null,
        "totalQuestions": null,
        "totalMarks": null,
        "marks": [{
          "noOfOptions": 4,
          "numberOfSubQuestions": null,
          "P": 0,
          "ADD": 1,
          "questionType": "Single Answer",
          "egnifyQuestionType": "Single answer type",
          "numberOfQuestions": null,
          "section": null,
          "C": 1,
          "W": 0,
          "U": 0,
          "start": 1,
          "end": null,
          "totalMarks": null
        }]
      }]
    }
  },
  metadata: {
    type: Object,
    default: {}
  },
  Qmap: {
    type: Array,
    default: []
  },
  syncTaskId: {
    type: String,
    default: null
  },
  qPageMapping: {
    type: Array,
    default: []
  },
  studentSnapshotSyncId: {
    type: String,
    default: null
  },
  autoResultUploadLock: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    default: false
  },
  fileKey: {
    type: String,
    default: null
  },
  branches: {
    type: Array,
    default: []
  },
  orientations: {
    type: Array,
    deffault: []
  },
  type: {
    type: String,
    default: "textbookbasedtest"
  }, // [textbookbasedtest , mocktest]
  testId: {
    type: String
  },
  gaStatus: {
    type: String,
    default: null
  },
  coins: {
    type: Number,
    default: 0
  },
  viewOrder: {
    type: Number,
    default: null
  },
  colorSchema: {
    type: Array,
    default: [{
        "color": "rgb(208, 2, 27)",
        "gt": 0,
        "lt": 25
      },
      {
        "color": "rgb(255, 171, 0)",
        "gt": 25,
        "lt": 50
      },
      {
        "color": "rgb(54, 179, 126)",
        "gt": 50,
        "lt": 100
      }
    ]
  },
  reviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  minimize: false
});

TestSchema.plugin(dataTables);

export async function getModel(userCxt) {
  const {
    instituteId
  } = userCxt;
  const db = await getDB(instituteId);

  return db.model('Test', TestSchema);
}

export default {
  getModel,
};
