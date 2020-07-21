
import { saveLogObject } from './api/logger/logger.controller';

export function morganMessageLogger(tokens, req, res) {
  const data = {}
  // Authentication status check.
  if (req.user) {
    data.email = req.user.email;
    data.isAuthenticated = true; // authentication Status.
  } else {
    data.isAuthenticated = false; // authentication Status.
  }
  data.headers = req.headers; // jwt secret token
  data.method = tokens.method(req, res); // method of request
  data.url = tokens.url(req, res); // url of the request
  data.responseLength = tokens.res(req, res, 'content-length'); // length of response
  data.responseTime = tokens['response-time'](req, res); // response time
  data.status = tokens.status(req, res); // status code
  data.statusMessage = res.statusMessage;
  data.remoteAddress = tokens['remote-addr'](req, res); // origin ip address
  data.date = tokens.date(req, res); // timestamp of the request
  data.referrer = tokens.referrer(req, res); // request referrer url.
  data.requestBody = req.body; // request body.
  data.requestParams = req.params; // request params.
  saveLogObject(data, {instituteId: "Egni_u001"}); // save the log object into the database.
  return "";
}

export default { morganMessageLogger };
