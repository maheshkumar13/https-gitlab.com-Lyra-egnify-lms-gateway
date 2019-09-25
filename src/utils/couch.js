const config = require("../config/environment/index")["config"];
const nano = require('nano')({
  url: config.COUCH_DB_URL,
  rejectunauthorized: false,
});

module.exports = nano;
