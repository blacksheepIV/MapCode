var router = require('express').Router();
var lodashIntersection = require('lodash/intersection');
var lodashTrim = require('lodash/trim');
var pointModel = require('../../models/points');

var jwt = require('../../utils/jwt');
var usersModel = require('../../models/users');
var validateWithSchema = require('../../utils').validateWithSchema;
var checkFriendshipStatus = require('../../models/users').checkFriendshipStatus;
var startLimitChecker = require('../../utils').startLimitChecker;
var customFielder = require('../../utils').customFielder;


router.use('/users/',
    jwt.JWTCheck,
    jwt.JWTErrorIgnore
);


/**
 * @api {get} /users/:username/points Get a user's points
 * @apiVersion 0.1.0
 * @apiName getUserPoints
 * @apiGroup users
 * @apiPermission public
 *
 * @apiDescription Get a user's points. If token user is username's friend
 * then he/she can access username's private points; Otherwise only
 * username's private points are accessible.
 *
 * @apiParam {String{5..15}} username
 * @apiParam {String[]} [fields] A combination of accessible fields split with comma: lat, lng, submission_date, name, phone, province, city, code, address, public, owner, rate, popularity, category, description, tags
 * @apiParam {Number{1..}} [start=1] Send points from start-th point!
 * @apiParam {Number{1..100}} [limit=100] Number of points to receive
 * @apiParam {Boolean} [private] Only private points
 * @apiParam {Boolean} [public] Only public points
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 *
 * @apiExample
 *     Request-Example:
 *         GET http://mapcode.ir/api/users/alireza/?private
 *     Response-Example:
 *         HTTP/1.1 200 OK
 *
 *         [{
 *            "lat": 24.32,
 *            "lng": 113.32,
 *            "submission_date": "2017-04-27T11:05:19.000Z",
 *            "name": "قصابی اصغرآفا و پسران",
 *            "phone": "03266118769",
 *            "province": "کرمان",
 *            "city": "کرمان",
 *            "code": "gLPQZOpnel5aKBzyVXvA",
 *            "address": "خیابان قسطنطنیه",
 *            "public": 0,
 *            "rate": 0,
 *            "popularity": 0,
 *            "category": "کبابی",
 *            "description": "یک توضیح!",
 *            "tags": ["رستوران", "food"]
 *          }]
 *
 *
 * @apiExample
 *     Request-Example:
 *         GET http://mapcode.ir/api/users/alireza/?start=10&limit=2&public&fields=lat,lng
 *     Response-Example:
 *         HTTP/1.1 200 OK
 *
 *         [
 *           {
 *              "lat": 24.32,
 *              "lng": 113.32
 *           },
 *           {
 *              "lat": 13.32,
 *              "lng": 2.3
 *           }
 *         ]
 *
 */
router.get('/users/:username/points',
    validateWithSchema(usersModel.schema, ['username'], null, 'checkParams'),

    jwt.JWTCheck,
    jwt.JWTErrorIgnore,

    startLimitChecker,

    customFielder('query', 'fields', pointModel.publicFields),

    checkFriendshipStatus(),

    function (req, res) {
        var publicOrPriavte = 'private';
        if (req.isFriend === true) {
            publicOrPriavte = null; // Both public and private
            if (req.query.public)
                publicOrPriavte = 'public';
            else if (req.query.private) {
                if (publicOrPriavte === 'public')
                    publicOrPriavte = null;
                else
                    publicOrPriavte = 'private';
            }
        }

        usersModel.getPoints(
            req.params.username,
            publicOrPriavte,
            req.queryFields,
            req.queryStart,
            req.queryLimit,
            function (err, points) {
                if (err) return res.status(500).end();

                res.json(points);
            }
        );
    }
);


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
 * <ul><li>email</li><li>friendship</li></ul>
 *
 * @apiParam {String{5..15}} username
 * @apiParam {String[]} [fields] A combination of accessible fields split with comma
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 *
 * @apiSuccess {String} friendship One one these values: `no`, `friend`, `pending_to_me` (Request has sent to me), `pending_from_me` (I have sent the request)
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
        req.friendshipRequested = false;

        // If field query string is present
        if (req.query.fields) {
            // Split and trim the fiends
            req.query.fields = req.query.fields.split(',').map(lodashTrim);

            if (req.query.fields.includes('friendship'))
                req.friendshipRequested = true;

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
            // If friendship field was not in requested fields
            if (!req.friendshipRequested) {
                if (req.isFriend)
                    req.queryFields = usersModel.friendFields;
                else
                    req.queryFields = usersModel.nonFriendFields;

                if (req.user)
                    req.friendshipRequested = true;
            }
        }

        next();
    },

    function (req, res) {
        usersModel.get(
            req.params.username,
            req.queryFields,
            function (err, user_info) {
                if (err) return res.status(500).end();

                // If user found
                if (user_info) {
                    // If request wants friendship status
                    if (req.friendshipRequested)
                        user_info.friendship = req.friendship;

                    res.json(user_info);
                }
                else
                    res.status(404).json({errors: ['username_not_found']});
            }
        );
    }
);


module.exports = router;
