/* eslint no-undef: 0 */
/* eslint no-throw-literal: 0 */

import { getModel as FileStatusModel } from './fileStatus.model';

export async function getFileStatus(req, res) {
  const { fileStatusId } = req.params
  if(!fileStatusId) return res.status(400).end('fileStatusId in params required');
  const FileStatus = await FileStatusModel(req.user_cxt);
  return FileStatus.findOne({ fileStatusId }, { _id: 0}).then(obj => res.send(obj));
}

export default {
  getFileStatus,
};
