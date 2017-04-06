var redis = require('redis');


var redis_client = redis.createClient();


module.exports = redis_client;
