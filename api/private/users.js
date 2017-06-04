var router = require('express').Router();
var asyncSeries = require('async/series');
var asyncSetImmediate = require('async/setImmediate');

var jwt = require('../../utils/jwt');
var usersModel = require('../../models/users');
var redis = require('../../utils/redis');
var smsModel = require('../../models/sms');
var validateWithSchema = require('../../utils').validateWithSchema;
var customFielder = require('../../utils').customFielder;


router.route('/users/')
    /**
     * @api {put} /users/ Update current user
     * @apiVersion 0.1.0
     * @apiName updateUser
     * @apiGroup users
     * @apiPermission private
     *
     * @apiDescription Update current user's information.
     *
     * @apiParam {string{1..40}} [name]
     * @apiParam {Number{5..10}} [melli_code]
     * @apiParam {Email{1..100}} [email]
     * @apiParam {Date} [date]
     * @apiParam {Number{11}} [mobile_phone]
     * @apiParam {Number{11}} [phone]
     * @apiParam {String{5..10}} [username]
     * @apiParam {String{6..20}} [password]
     * @apiParam {String{0..21844}} [address]
     * @apiParam {String{0..21844}} [description]
     * @apiParam {Numeric{5}} [sms_code] This is required only if user wants to update mobile_phone
     *
     *
     * @apiExample {json} Request-Example
     *     {
     *         "name": "حمیدرضا",
     *         "melli_code": "1234567890",
     *         "email": "h.mahdavipanah@gmail.com",
     *         "date": "1996-02-15",
     *         "mobile_phone": "09378965477",
     *         "phone": "03155448765",
     *         "username": "mahdavipanah",
     *         "password": "mysecretpass!",
     *         "description": "",
     *         "address": "خیابان امیرکبیر",
     *         "sms_code": "54879",
     *     }
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_40
     * @apiError (400) name: not_persian_name Name can only contain persian's letter and space and semi-space
     *
     * @apiError (400) melli_code:empty
     * @apiError (400) melli_code:not_numeric
     * @apiError (400) melli_code:length_5_not_10
     *
     * @apiError (400) email:empty
     * @apiError (400) email:invalid_email Does not have the correct email format
     * @apiError (400) email:length_not_1_to_100
     *
     * @apiError (400) date:empty
     * @apiError (400) date:not_a_date Does not have the correct date format (uses Moment().isValid)
     *
     * @apiError (400) mobile_phone:empty
     * @apiError (400) mobile_phone:not_numeric
     * @apiError (400) mobile_phone:length_not_11
     *
     * @apiError (400) phone:not_numeric
     * @apiError (400) phone:length_not_11
     *
     * @apiError (400) username:empty
     * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
     * @apiError (400) username:length_not_5_to_15
     *
     * @apiError (400) password:empty
     * @apiError (400) password:length_not_6_to_20
     *
     * @apiError (400) address:length_greater_than_21844
     *
     * @apiError (400) description:length_greater_than_21844
     *
     * @apiError (400) sms_code:empty
     * @apiError (400) sms_code:not_numeric
     * @apiError (400) sms_code:length_not_5
     *
     * @apiError (400) sms_code_not_valid
     *
     * @apiError (409) duplicate_melli_code
     * @apiError (409) duplicate_email
     * @apiError (409) duplicate_mobile_phone
     * @apiError (409) duplicate_username
     */
    .put(
        validateWithSchema(usersModel.schema, usersModel.updatableFields, 'all'),

        function (req, res) {
            asyncSeries([
                // Handle `mobile_phone` field
                function (next) {
                    // If mobile_phone doesn't need to get updated
                    if (!req.body.mobile_phone) {
                        return asyncSetImmediate(function () {
                            delete req.body.sms_code;
                            next();
                        });
                    }

                    redis.get(smsModel.phoneNumberKey(req.body.mobile_phone), function (err, reply) {
                        // Redis error
                        if (err) {
                            next('serverError');
                            return console.error("API {PUT}/users/: Redis: Getting phone_number verification code: %s", err);
                        }

                        // Verification code has been expired or does not match
                        if (reply === null || req.body.sms_code !== reply)
                            return next('sms_code_not_valid');

                        delete req.body.sms_code;

                        next();
                    });
                },
                function (next) {
                    usersModel.updateUser(
                        req.body,
                        {id: req.user.id},
                        function (err) {
                            if (err) {
                                if (err === 'serverError')
                                    return next(err);

                                // Duplicate entries error
                                return next(err);
                            }

                            next();
                        }
                    );
                }
            ], function (err) {
                if (!err)
                    return res.status(200).end();

                if (err === 'serverError')
                    res.status(500).end();
                else if (err === 'sms_code_not_valid')
                    res.status(400).json({
                        errors: [err]
                    });
                else
                    res.status(409).json({
                        errors: err
                    });
            });


        }
    )
    /**
     * @api {get} /users/ Gets signed-in users's information
     * @apiVersion 0.1.0
     * @apiName usersGet
     * @apiGroup users
     * @apiPermission public
     *
     * @apiDescription Get user's information by providing a token
     *
     * @apiParam {String[]} [fields] A combination of fields split with comma: name, melli_code, email, date, mobile_phone, phone, username, address, description, type, code, credit, bonus, recommender_user, friend_requests_count, friends_count
     *
     *
     * @apiSuccessExample
     *     Request-Example:
     *         GET http://mapcode.ir/api/users?fiends=melli_code,email,address
     *     Response:
     *         HTTP/1.1 200 OK
     *
     *         {
     *             "melli_code": "1234567891",
     *             "email": "test@test.com",
     *             "address": "خیابان امیبرکبیر"
     *         }
     *
     *
     * @apiSuccessExample
     *     Request-Example:
     *         GET http://mapcode.ir/api/users
     *     Response:
     *         HTTP/1.1 200 OK
     *
     *         {
     *             "name": "علیرضا",
     *             "melli_code": "1234567654",
     *             "email": "a.alireza@gmail.com",
     *             "date": "2017-04-26",
     *             "mobile_phone": "09368765417",
     *             "phone": null,
     *             "username": "alireza",
     *             "address": null,
     *             "description": null,
     *             "type": 0,
     *             "code": "Opnel5aKBz",
     *             "credit": 3,
     *             "bonus": 0,
     *             "recommender_user": "wMvbmOeYAl",
     *             "friend_requests_count": 3,
     *             "friends_count": 50
     *         }
     *
     */
    .get(
        customFielder('query', 'fields', usersModel.publicFields.concat(['friend_requests_count', 'friends_count'])),

        function (req, res) {
            usersModel.getDetailed(
                req.user.username,
                req.queryFields,
                function (err, user_info) {
                    if (err) return res.status(500).end(0); // Server error

                    // If there is no such a user in database
                    // it means that token is in Redis
                    // so let's remove the token from Redis
                    // and return 401 Unauthorized error
                    if (!user_info) {
                        console.error("{GET}/users/: ! : Non-existent user have passed the token auth: token:\n\t%s", JSON.stringify(req.user));

                        res.status(401).json({
                            errors: ["auth_failure"]
                        });

                        return jwt.removeFromRedis(req.user.id);

                    }

                    res.send(user_info);

                }
            );
        });



router.post('/users/documents/', function (req, res) {
    // TODO: User document upload
    res.send("Hello from documents!");
});


module.exports = router;
