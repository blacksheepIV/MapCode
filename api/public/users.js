var router = require('express').Router();
var moment = require('moment');
var lodashIntersection = require('lodash/intersection');
var lodashTrim = require('lodash/trim');

var jwt = require('../../utils/jwt');
var db = require('../../db');
var usersModel = require('../../models/users');
var validateWithSchema = require('../../utils').validateWithSchema;
var checkFriendshipStatus = require('../../utils').checkFriendshipStatus;


router.use('/users/',
    jwt.JWTCheck,
    jwt.JWTErrorIgnore
);

router.route('/users/')
    /**
     * @api {get} /users/ Gets signed-in users's information
     * @apiVersion 0.1.0
     * @apiName usersGet
     * @apiGroup users
     * @apiPermission public
     *
     * @apiDescription Get user's information by providing a token.
     * <br /> If no query parameter specified, all user's information fields will get returned.
     *
     * @apiParam {Boolean} name
     * @apiParam {Boolean} melli_code
     * @apiParam {Boolean} email
     * @apiParam {Boolean} date
     * @apiParam {Boolean} mobile_phone
     * @apiParam {Boolean} phone
     * @apiParam {Boolean} username
     * @apiParam {Boolean} address
     * @apiParam {Boolean} description
     * @apiParam {Boolean} type
     * @apiParam {Boolean} code
     * @apiParam {Boolean} credit
     * @apiParam {Boolean} bonus
     * @apiParam {Boolean} recommender_user
     * @apiParam {Boolean} friend_requests_count
     * @apiParam {Boolean} friends_count
     *
     *
     * @apiSuccessExample
     *     Request-Example:
     *         GET http://mapcode.ir/api/users?melli_code&email&address
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
     * @apiError (401) auth_failure
     *
     * @apiError (404) user_not_found If this error happened, sign out the user.
     *
     */
    .get(function (req, res) {
        // Check if user is signed-in or not
        if (!req.user) {
            return res.status(401).json({
                errors: ["auth_failure"]
            });
        }

        var allFields = usersModel.publicFields.concat(['friend_requests_count', 'friends_count']);

        var fields = lodashIntersection(
            Object.keys(req.query),
            allFields
        );
        if (fields.length === 0)
            fields = allFields;

        db.runSelectQuery(
            {
                columns: fields,
                table: 'users_detailed',
                conditions: {
                    username: req.user.username
                }
            },
            function (err, results) {
                if (err) {
                    console.error("MySQL: Error in getting token user's info: %s", err);
                    return res.status(500).end();
                }

                if (results.length === 0) {
                    console.error("!!!: Non-existent user have passed the token auth: token: %s", JSON.stringify(req.user));
                    return res.status(404).json({
                        errors: ["user_not_found"]
                    });
                }

                if (results[0].date)
                    results[0].date = moment(results[0].date).format('YYYY-MM-DD');

                res.send(results[0]);
            }
        );

    });


/**
 * @api {get} /users/:username Get a user's information
 * @apiVersion 0.1.0
 * @apiName getUser
 * @apiGroup users
 * @apiPermission public
 *
 * @apiDescription Get a user's information. If current user is signed out
 * or is signed in but is not `username`'s friend, these fields are accessible:
 * <ul><li>name</li><li>phone</li><li>username</li><li>description</li></ul>
 * But if user is signed in and is also a friend of `username` in addition
 * to above field these fields are also accessible:
 * <ul><li>email</li></ul>
 *
 * @apiParam {String{5..15}} username
 * @apiParam {String[]} [fields] A combination of accessible fields split with comma
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/api/users/mohammad?fields=email,username
 *     Response:
 *         HTTP/1.1 200 OK
 *
 *         {
 *             "email": "test@test.com",
 *             "username": "mohammad"
 *         }
 *
 *  @apiError (404) username_not_found There is no user with given username
 */
router.get('/users/:username',
    jwt.JWTCheck,
    jwt.JWTErrorIgnore,

    validateWithSchema(usersModel.schema, ['username'], null, 'checkParams'),

    checkFriendshipStatus(),

    function (req, res, next) {
        req.queryFields = [];

        // If field query string is present
        if (req.query.fields) {
            // Split and trim the fiends
            req.query.fields = req.query.fields.split(',').map(lodashTrim);

            if (req.isFriend)
                req.queryFields = lodashIntersection(
                    req.query.fields,
                    usersModel.friendFields
                );
            else
                req.queryFields = lodashIntersection(
                    req.query.fields,
                    usersModel.nonFriendFields
                );

        }

        // If field query string is not present or fields is empty after intersection
        if (!req.query.fields || !req.queryFields.length){
            if (req.isFriend)
                req.queryFields = usersModel.friendFields;
            else
                req.queryFields = usersModel.nonFriendFields;
        }

        next();
    },

    function (req, res) {
        usersModel.get(
            req.params.username,
            req.queryFields,
            function (err, results) {
                if (err) return res.status(500).end();

                // If user found
                if (results)
                    res.send(results);
                else
                    res.status(404).json({errors: ['username_not_found']});
            }
        );
    }
);


module.exports = router;
