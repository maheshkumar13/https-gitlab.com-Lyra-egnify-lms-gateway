/**
 *@description
 *    Live classes schema
 * @Author :
 *   Sumalatha
 * @date
 *    18/01/2021
 */
import mongoose from 'mongoose';
import { getDB } from '../../db';

const settingsSchema = new mongoose.Schema({
  host_video: {
    type: Boolean
  },
  participant_video: {
    type: Boolean
  },
  cn_meeting: {
    type: Boolean
  },
  in_meeting: {
    type: Boolean
  },
  join_before_host: {
    type: Boolean
  },
  jbh_time: {
    type: Number
  },
  mute_upon_entry: {
    type: Boolean
  },
  watermark: {
    type: Boolean
  },
  use_pmi: {
    type: Boolean
  },
  approval_type: {
    type: Number
  },
  audio: {
    type: String
  },
  auto_recording: {
    type: String
  },
  enforce_login: {
    type: Boolean
  },
  enforce_login_domains: {
    type: String
  },
  alternative_hosts: {
    type: String
  },
  close_registration: {
    type: Boolean
  },
  show_share_button: {
    type: Boolean
  },
  allow_multiple_devices: {
    type: Boolean
  },
  registrants_confirmation_email: {
    type: Boolean
  },
  waiting_room: {
    type: Boolean
  },
  request_permission_to_unmute_participants: {
    type: Boolean
  },
  registrants_email_notification: {
    type: Boolean
  },
  meeting_authentication: {
    type: Boolean
  },
  encryption_type: {
    type: String
  },
  approved_or_denied_countries_or_regions: {
    enable: {
      type: Boolean
    }
  }
})

const classDetailsSchema = new mongoose.Schema({
    uuid: {type: String},
    id: {type: Number},
    host_id: {type: String},
    host_email: {type: String},
    topic: {type: String},
    type: {type: Number},
    status: {type: String},
    timezone: {type: String},
    agenda: {type: String},
    created_at: {type: Date},
    start_url: {type: String},
    join_url: {type: String},
    password: {type: String},
    h323_password: {type: String},
    pstn_password: {type: String},
    encrypted_password: {type: String},
    settings: {type:settingsSchema}
  });
const LiveClassesSchema = new mongoose.Schema({
  name: {type:String,requried:true},
  startTime:{type:Date,required:true},
  endTime:{type:Date,required:true},
  duration:{type:Number,required:true, default:0},
  class:{type:Array,required:true},
  branch:{type:Array,required:true},
  section:{type:Array,required:true},
  orientations:{type:Array,required:true},
  teacher:{type:String,required:true},
  coHost :{type:Array},
  textbook:{type:String},
  subject:{type:String},
  topic:{type:String},
  thumbnail:{type:String},
  classDetails:{type:classDetailsSchema,required:true},
  active: { type: Boolean, default: true },
  hostedOn:{type:String,default:'zoom'}
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export async function getModel(userCxt) {
  const { instituteId } = userCxt;
  const db = await getDB(instituteId);
  return db.model('LiveClasses', LiveClassesSchema);
}
export default {
  getModel,
};
