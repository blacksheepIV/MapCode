var router = require('express').Router();
var randomstring = require("randomstring");

var redis = require('../../utils/redis');

var smsModel = require('../../models/sms');


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
     * @apiParam {String{11}} mobile_phone User's phone number.
     *
     * @apiExample {json} Request-Example:
     *     {
     *         "mobile_phone": "09337658744"
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
     * @apiError (400) {mobile_phone} empty Phone number is empty.
     * @apiError (400) {mobile_phone} not_numeric Phone number can only contain digits.
     * @apiError (400) {mobile_phone} length_not_11 Phone number should have a length of 11.
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *         "errors" : {
     *             "mobile_phone": [
     *                 "not_numeric",
     *                 "length_not_11"
     *             ]
     *         }
     *     }
     */
    .post(function (req, res) {
        req.validateBodyWithSchema(smsModel.schema, 'all', function () {
            var redis_key = smsModel.phoneNumberKey(req.body.mobile_phone);

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
                                console.error("Redis: Setting phone verification code expiration: " + err);
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
