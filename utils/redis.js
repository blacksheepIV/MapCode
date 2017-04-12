var redis = require('redis');


var redis_client = redis.createClient();

redis_client.on("error", function(err) {
    console.error("Redis Error : " + err);
});

// If REDIS_PASSWORD variable is defined inside .env file
if (typeof process.env.REDIS_PASSWORD !== 'undefined') {
    // Authenticate Redis
    redis_client.auth(process.env.REDIS_PASSWORD);
}

module.exports = redis_client;
