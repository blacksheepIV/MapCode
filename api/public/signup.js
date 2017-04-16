var router = require('express').Router();

var redis = require('../../utils/redis');

var smsModel = require('../../models/sms');
var usersModel = require('../../models/users');


router.route('/signup')
    /**
     * @api {post} /signup/ Create a new user by Signing up
     * @apiVersion 0.1.0
     * @apiName signUp
     * @apiGroup signUp
     * @apiPermission public
     *
     * @apiDescription For a correct signup, first a request should be sent to /sms/ in order to generate <br />
     * a new SMS verification code, then within 120 seconds, a request should be sent to /signup/.
     *
     * @apiParam {string{1..40}} name Person's first name and last name or company's name
     * @apiParam {Number{10}} melli_code Person's melli code or company's code
     * @apiParam {Email{1..100}} email Person or company's email
     * @apiParam {Date} date Person or company's birthdate
     * @apiParam {Number{11}} mobile_phone Person or company's mobile phone number
     * @apiParam {String{5..15}} username Person or company's username
     * @apiParam {String{6..20}} password Person or company's account password
     * @apiParam {String{10}} [recommender_user] Code of the user who recommended this user
     * @apiParam {Numeric=0,2} type 0 for Person, 2 for Company
     * @apiParam {Numeric{5}} sms_code The verification code that has been sent to user's mobile phone number
     *
     * @apiExample {json} Request-Example
     *     {
     *         "name": "حمیدرضا",
     *         "melli_code": "1234567890",
     *         "email": "h.mahdavipanah@gmail.com",
     *         "date": "1996-02-15",
     *         "mobile_phone": "09378965477",
     *         "username": "mahdavipanah",
     *         "password": "mysecretpass!",
     *         "type": "0",
     *         "sms_code": "54879",
     *         "recommender_user": "nfI8E4oP10"
     *     }
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *
     *
     *
     * @apiError (400) {name} empty
     * @apiError (400) {name} length_no_1_to_40
     * @apiError (400) {name} not_persian_name Name can only contain persian's letter and space and semi-space
     *
     * @apiError (400) {melli_code} empty
     * @apiError (400) {melli_code} not_numeric
     * @apiError (400) {melli_code} length_to_10
     *
     * @apiError (400) {email} empty
     * @apiError (400) {email} invalid_email Does not have the correct email format
     * @apiError (400) {email} length_not_1_to_100
     *
     * @apiError (400) {date} empty
     * @apiError (400) {date} not_a_date Does not have the correct date format
     *
     * @apiError (400) {mobile_phone} empty
     * @apiError (400) {mobile_phone} not_numeric
     * @apiError (400) {mobile_phone} length_not_11
     *
     * @apiError (400) {username} empty
     * @apiError (400) {username} not_valid_username Can only start with english letters and then have letters, underscores, or numbers
     * @apiError (400) {username} length_not_5_to_15
     *
     * @apiError (400) {password} empty
     * @apiError (400) {password} length_not_6_to_20
     *
     * @apiError (400) {recommender_user} not_alpha_numeric
     * @apiError (400) {recommender_user} length_not_10
     *
     * @apiError (400) {type} empty
     * @apiError (400) {type} not_0_or_2
     *
     * @apiError (400) {sms_code} empty
     * @apiError (400) {sms_code} not_numeric
     * @apiError (400) {sms_code} length_not_5
     *
     * @apiError (400) SMSCodeNotValid
     * @apiError (400) noRecommenderUserWithThisCode
     *
     * @apiError (409) duplicateMelli_code
     * @apiError (409) duplicateEmail
     * @apiError (409) duplicateMobile_phone
     * @apiError (409) duplicateUsername
     */
    .post(function(req, res) {
        req.validateBodyWithSchema(usersModel.schema, 'all', function () {
            // Check if sms verification code is correct
            redis.get(smsModel.phoneNumberKey(req.body.mobile_phone), function (err, reply) {
                if (err) {
                    res.status(500).end();
                    console.error("Redis: Getting phone_number verification code: %s", err);

                    return;
                }
                // Verification code has been expired
                // or does not match
                if (reply === null || req.body.sms_code !== reply) {
                    res.status(400).json({
                        error: ['SMSCodeNotValid']
                    });

                    return;
                }

                delete req.body['sms_code'];

                usersModel.createNewUser(req.body, function (err) {
                    if (err === null)
                        res.status(200).end();
                    else {
                        if (err === 'serverError') {
                            res.status(500).end();
                        }
                        else if (err === 'noRecommenderUserWithThisCode') {
                            res.status(400).json({
                                errors: [err]
                            });
                        }
                        // Duplication error in request fields
                        else {
                            res.status(409).json({
                                errors: err
                            });
                        }
                    }
                });
            });
        },
        // Ignore this field's validation if it does not exist in request
        ['recommender_user']);
    });


module.exports = router;
