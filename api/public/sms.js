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
    /**
     * @api {post} /sms/ Send SMS verification code
     * @apiVersion 0.1.0
     * @apiName sendSMS
     * @apiGroup SMS
     * @apiPermission public
     *
     * @apiDescription Generate a random 5-length numeric code and store it. <br />
     * This code then should be sent to signup API in order to verify the user's phone number. <br />
     * The generated code will be expired after 120 seconds. <br />
     * If already there is a code for given phone number, the request will be ignored.
     *
     * @apiParam {String{11}} phone_number User's phone number.
     *
     * @apiExample {json} Request-Example:
     *     {
     *         "phone_number": "09337658744"
     *     }
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *
     * @apiError (429) PhoneNumberAlreadyHasACode This phone number already has a registered verification code.
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 429 Too Many Requests
     *     {
     *         "errors": ["PhoneNumberAlreadyHasACode"]
     *     }
     *
     * @apiError (400) {phone_number} empty Phone number is empty.
     * @apiError (400) {phone_number} not_int Phone number can only contain digits.
     * @apiError (400) {phone_number} length_not_11 Phone number should have a length of 11.
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *         "errors" : {
     *             "phone_number": [
     *                 "not_int",
     *                 "length_not_11"
     *             ]
     *         }
     *     }
     */
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
                        res.status(429).json({
                            errors: ['PhoneNumberAlreadyHasACode']
                        });
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
