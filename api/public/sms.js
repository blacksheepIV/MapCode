var router = require('express').Router();
var randomstring = require("randomstring");

var redis = require('../../utils/redis');


var schema = {
    'phone_number': {
        notEmpty: {
            options: true,
            errorMessage: 'empty'
        },
        isInt: {
            options: true,
            errorMessage: 'not_int'
        },
        isLength: {
            options: {max: 11, min: 11},
            errorMessage: 'length_not_11'
        }
    }
};

router.route('/sms')
    .post(function (req, res) {
        req.validateBodyWithSchema(schema, ['phone_number'], function () {
            var redis_key = process.env.REDIS_PREFIX + 'mphone:' + req.body.phone_number;

            redis.setnx(redis_key, randomstring.generate({
                length: 5,
                charset: 'numeric'
            }), function (err, reply) {
                if (!err) {
                    // The key didn't exist and was set
                    if (reply === 1) {
                        redis.expire(redis_key, 120, function (err, reply) {
                            if (err) {
                                res.status(500).end();
                                console.error("Redis: Setting phone verification code expiration : " + err);
                                return;
                            }
                            // If key does not exist or the timeout could not be set
                            if (reply === 0) {
                                res.status(500).end();
                                console.error("Redis: Setting phone verification code expiration : key does not exist or the timeout cannot not be set");
                            }
                            // Phone verification code successfully generated
                            else {
                                res.status(200).end();

                                // TODO: Send SMS request to SMS service provider API
                            }
                        });
                    }
                    // The Redis key is already exists
                    else {
                        // Too many requests
                        res.status(429).end();
                    }
                }
                // Redis SETNX error
                else {
                    res.status(500).end();
                    console.error("Redis : Setting phone verification code : " + err);
                }
            });
        });
    });


module.exports = router;
