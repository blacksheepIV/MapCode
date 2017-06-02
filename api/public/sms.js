var router = require('express').Router();
var randomstring = require("randomstring");

var redis = require('../../utils/redis');
var smsModel = require('../../models/sms');
var validateWithSchema = require('../../utils').validateWithSchema;


router.route('/sms/')
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
     * @apiSuccessExample (In production environment) Success-Response:
     *     HTTP/1.1 200 OK
     *
     * @apiSuccessExample (In non-production environment) Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         "sms_code": "34523"
     *     }
     *
     * @apiError (429) phone_number_already_has_a_code This phone number already has a registered verification code.
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 429 Too Many Requests
     *     {
     *         "errors": ["mobile_phone_already_has_a_code"]
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
    .post(
        // Validation
        validateWithSchema(smsModel.schema, 'all'),

        function (req, res) {
            var redis_key = smsModel.phoneNumberKey(req.body.mobile_phone);

            var smsVerificationCode = randomstring.generate({
                length: 5,
                charset: 'numeric'
            });
            redis.setnx(redis_key, smsVerificationCode, function (err, reply) {
                // Redis error
                if (err) {
                    console.error("{POST}/sms/: Redis: Error in setting phone verification code:\n\t%s", err);
                    return res.status(500).end();
                }

                // The key didn't exist and was set
                if (reply === 1) {
                    redis.expire(redis_key, 120, function (err, reply) {
                        // Redis error
                        if (err) {
                            console.error("{POST}/sms/: Redis: Error in setting phone verification code expiration:\n\t%s", err);
                            return res.status(500).end();
                        }

                        if (process.env.NODE_ENV !== 'production')
                            res.json({
                                'sms_code': smsVerificationCode
                            });
                        else
                            res.status(200).end();

                        // TODO: Send SMS request to SMS service provider API
                    });
                }
                // The Redis key is already exists
                else {
                    // Too many requests
                    res.status(429).json({
                        errors: ['mobile_phone_already_has_a_code']
                    });
                }
            });
        }
    );


module.exports = router;
