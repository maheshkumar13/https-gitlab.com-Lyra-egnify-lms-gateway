
export function index(req, res) {
  const data = req.body;

  // Was an image uploaded? If so, we'll use its public URL
  // in cloud storage.
  if (req.file && req.file.cloudStoragePublicUrl) {
    data.fileUrl = req.file.cloudStoragePublicUrl;
    return res.status(200).send(data);
  }
  if (req.file) {
    return res.status(404).send('Please upload a file');
  }
  if (req.file.cloudStoragePublicUrl) {
    return res.status(404).send('CDN is not responding. Not a ble to upload.');
  }
  return res.status(500).send();
}

export default index;
