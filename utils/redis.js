var redis = require('redis');


var redis_client = redis.createClient();

redis_client.on("error", function(err) {
    console.error("Redis Error : " + err);
});


module.exports = redis_client;
