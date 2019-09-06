const redis = require("redis");
import { config } from '../config/environment/index';
const client = redis.createClient({
  host : config.redis.host,
  port : 6379,
  password : config.redis.password
});

client.on("error", function (err) {
  console.log("Error " + err);
});

module.exports = client;