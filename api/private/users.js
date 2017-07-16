var fs = require('fs');
var path = require('path');
var router = require('express').Router();
var asyncSeries = require('async/series');
var asyncWaterfall = require('async/waterfall');
var asyncSetImmediate = require('async/setImmediate');
var multer = require('multer');
var mime = require('mime-types');
var glob = require('glob');

var jwt = require('../../utils/jwt');
var usersModel = require('../../models/users');
var redis = require('../../utils/redis');
var smsModel = require('../../models/sms');
var validateWithSchema = require('../../utils').validateWithSchema;
var customFielder = require('../../utils').customFielder;


/*
    Create docs folder for user documents if not exists.
 */
require('mkdirp')(path.join(__dirname, '../../public/docs'), function (err) {
    if (err)
        console.error("api/private/users.js: Error in creating if not exists docs directory: mkdirp:\n\t\t%s", err);
});


router.route('/users-document')
    .all(
        usersModel.getMiddleware({
            fields: 'type'
        })
    )
    /**
     * @api {get} /users-document  Get current user's document
     * @apiVersion 0.1.0
     * @apiNAme getUserDocument
     * @apiGroup users
     * @apiPermission private
     *
     * @apiError (404) document_not_found If user is not verified or pending.
     */
    .get(
        function (req, res) {
            // If user is unverified
            if (req.user.type === 0 || req.user.type === 2) {
                return res.status(404).end({errors: ['document_not_found']});
            }

            usersModel.getLatestDocument(req.user.id, function (err, latestDocPath) {
                if (err) return res.status(500).end();

                return res.download(
                    latestDocPath,
                    'documents' + latestDocPath.substr(latestDocPath.lastIndexOf('.') + 1),
                    function (err) {
                        // Error during sending latest user's doc as response
                        if (err) {
                            return res.status(500).end();
                        }
                    }
                );
            });
        }
    )
    /**
     * @api {post} /users-document Delete current user's document
     * @apiVersion 0.1.0
     * @apiNAme deleteUserDocument
     * @apiGroup users
     * @apiPermission private
     *
     * @apiDescription If user is unverified (type 0 for real users and 2 for legal users)
     * nothing will happen.<br />If user is pending (type 4 and 6 for unverified real users and verified
     * real users, and 5 and 7 for unverified legal users and verified legal users) then latest
     * uploaded document will get removed and user's type will get updated to what it was
     * before uploading the latest document.<br />If user is verified nothing will happen; So if
     * a verified user wants to become unverified, has to send an ticket for admin.
     *
     * @apiSuccess {Number} userType User's new type. User's type can remain the same.
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *     {
     *       "userType": 0
     *     }
     */
    .delete(
        function (req, res) {
            var newUserType = null;

            // If user is in pending mode
            if (req.user.type >= 4) {
                // Search and find the type that user has transformed from that to current type
                newUserType = usersModel.documentUploadNewType.indexOf(req.user.type);

                usersModel.updateUser(
                    // Search and find the type that user has transformed from that to current type
                    {type: newUserType},
                    req.user.id,
                    function (err) {
                        // Problem happened during updating user's type
                        if (err) return res.status(500).end();

                        usersModel.getLatestDocument(req.user.id, function (err, latestDocPath) {
                            if (err) return res.status(500).end();

                            if (latestDocPath)
                                // Remove latest user's doc
                                fs.unlink(latestDocPath, function () {});

                            return res.status(200).json({userType: newUserType});
                        });
                    }
                );
            }
            // If user is verified or unverified
            else {
                // Do nothing and just say OK!
                res.status(200).json({userType: req.user.type});
            }
        }
    )
    /**
     * @api {post} /users-document Update current user's document
     * @apiVersion 0.1.0
     * @apiNAme updateUserDocument
     * @apiGroup users
     * @apiPermission private
     *
     * @apiDescription If current user is verified (type 1 for real users and 3 for legal users),
     * Account will go to verified and pending mode (type 6 for real users and 7 for legal users),
     * But if the account is not verified, Account will go to pending mode (type 4 for real users
     * and 5 for legal users).<br />If account is in pending mode any attempt to upload document
     * will result in overriding the latest uploaded but not verified document.
     * <br />This POST request should be sent as multipart/form-data.
     *
     * @apiParam {File} document
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *     {
     *       "userType": 4
     *     }
     *
     * @apiSuccess {Number} userType User's new type. User's type can remain the same.
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "error": "file_size",
     *       "maxSize": 10
     *     }
     *
     *
     * @apiError (400) not_document_file No file has been sent in 'document' form field.
     * @apiError (400) file_size File is bigger than max size limit. Size limit can be accessed in 'maxSize' (in MB) property of returned JSON.
     * @apiError (400) not_zip_or_rar File is not 'zip' or 'rar' format.
     */
    .post(
        multer().single('document'),
        function (req, res) {
            // Check if a file has been sent
            if (!req.file)
                return res.status(400).json({error: 'not_document_file'});

            // Check file's size
            // Uses process.env.MAX_DOCUMENT_SIZE if it's defined otherwise 10MB
            var maxFileSize = (process.env.MAX_DOCUMENT_SIZE * 1024 * 1024 || 10 * 1024 * 1024);
            if (req.file.size > maxFileSize)
                return res.status(400).json({error: 'file_size', maxSize: maxFileSize / (1024 * 1024)});

            // See file's mime type and check if it's an zip or rar
            if (!Object.keys(usersModel.documentMimeTypes).includes(req.file.mimetype))
                return res.status(400).json({error: 'not_zip_or_rar'});

            var newUserType = null;
            // User is is not in pending state
            if (req.user.type <= 3)
            // User's new type
                newUserType = usersModel.documentUploadNewType[req.user.type];

            // New document's path
            var filePath = path.join(
                __dirname,
                '../../public/docs/',
                req.user.id.toString() + // User's id
                    '-' + (new Date()).getTime() + // Date as unix timestamp
                    '.' + usersModel.documentMimeTypes[req.file.mimetype] // File extension
            );

            asyncWaterfall([
                // Get latest doc path for the user
                function (callback) {
                    usersModel.getLatestDocument(req.user.id, function (err, latestDocPath) {
                        callback(null, latestDocPath || null);
                    });
                },
                // Start saving new document
                function (latestDocPath, callback) {
                    fs.writeFile(
                        filePath,
                        req.file.buffer,
                        function (err) {
                            // serverError
                            if (err) {
                                res.status(500).end();
                                console.error("API {POST}/users-document: fs:\n\t\t%s", err);
                                return callback();
                            }

                            // If user type needs to get updated
                            if (newUserType) {
                                // Update user's type
                                usersModel.updateUser({type: newUserType}, req.user.id, function (err) {
                                    /* If any problem happened in updating user's type,
                                       delete newly created document. */
                                    if (err) {
                                        res.status(500).end();
                                        // Remove newly updated user's document
                                        fs.unlink(filePath, function () {});
                                        return callback();
                                    }

                                    return res.status(200).json({userType: newUserType});
                                });
                            }
                            else {
                                /* Remove last user document,
                                 Because probably the user wanted to
                                 edit the document */
                                if (latestDocPath)
                                    fs.unlink(latestDocPath, function () {});

                                res.status(200).json({userType: req.user.type});
                                return callback();
                            }
                        }
                    );
                }
            ]);
        }
    );


router.route('/users-avatar')
    /**
     * @api {post} /users-avatar Updates current user's avatar image
     * @apiVersion 0.1.0
     * @apiNAme updateUserAvatar
     * @apiGroup users
     * @apiPermission private
     *
     * @apiDescription Uploads and replaces if exists, the user's avatar image.
     * <br />This POST request should be sent as multipart/form-data.
     *
     * @apiParam {File} avatar
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "error": "file_size",
     *       "maxSize": 100
     *     }
     *
     *
     * @apiError (400) not_avatar_file No file has been sent in 'avatar' form field.
     * @apiError (400) file_size File is bigger than max size limit. Size limit can be accessed in 'maxSize' (in KB) property of returned JSON.
     * @apiError (400) not_an_image File is not an image.
     */
    .post(
        multer().single('avatar'),
        function (req, res) {
            // Check if a file has been sent
            if (!req.file)
                return res.status(400).json({error: 'not_avatar_file'});

            // Check file's size
            // Uses process.env.MAX_AVATAR_SIZE if it's defined otherwise 100KB
            var maxFileSize = (process.env.MAX_AVATAR_SIZE * 1024 || 102400);
            if (req.file.size > maxFileSize)
                return res.status(400).json({error: 'file_size', maxSize: maxFileSize / 1024});

            // See file's mime type and check if it's an image
            if (!req.file.mimetype.startsWith('image'))
                return res.status(400).json({error: 'not_an_image'});

            var avatarExtension = mime.extension(req.file.mimetype);
            if (avatarExtension === false)
                return res.status(400).json({error: 'not_an_image'});

            fs.writeFile(
                path.join(__dirname, '../../public/img/avatars/', req.user.id.toString() + '.' + avatarExtension),
                req.file.buffer,
                function (err) {
                    // serverError
                    if (err) {
                        res.status(500).end();
                        return console.error("API {POST}/users-avatar/: fs:\n\t\t%s", err);
                    }

                    res.status(200).end();
                }
            );
        }
    )
    /**
     * @api {post} /users-avatar Delete current user's avatar image
     * @apiVersion 0.1.0
     * @apiNAme deleteUserAvatar
     * @apiGroup users
     * @apiPermission private
     *
     * @apiDescription If user has no avatar image noting will happen.
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     */
    .delete(function (req, res) {
        glob(
            path.join(__dirname, '../../public/img/avatars/', req.user.id.toString() + '.*'),
            function (err, files) {
                if (err)
                    console.error("API {DELETE}/users-avatar/: glob:\n\t\t%s", err);
                else if (files)
                        fs.unlink(files[0]);

                res.status(200).end();
            }
        );
    });


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
                        req.user.id,
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
     * @apiParam {String[]} [fields] A combination of fields split with comma: name, melli_code, email, date, mobile_phone, phone, username, address, description, type, code, credit, bonus, recommender_user, friend_requests_count, friends_count, points_count, personal_points_count, sent_messages_count, received_messages_count, unread_messages_count
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
     *             "friends_count": 50,
     *             "points_count": 3,
     *             "personal_points_count": 2,
     *             "sent_messages_count": 0,
     *             "received_messages_count": 0,
     *             "unread_messages_count": 0
     *         }
     *
     */
    .get(
        customFielder('query', 'fields', usersModel.detailedPublicFields, true),

        function (req, res) {
            usersModel.getDetailed(
                {id: req.user.id},
                req.queryFields,
                function (err, user_info) {
                    if (err) return res.status(500).end(0); // Server error

                    /* If there is no such a user in database
                       it means that token is in Redis
                       so let's remove the token from Redis
                       and return 401 Unauthorized error */
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


module.exports = router;
