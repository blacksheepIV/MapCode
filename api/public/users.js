var router = require('express').Router();
var moment = require('moment');
var lodashIntersection = require('lodash/intersection');

var jwt = require('../../utils/jwt');
var db = require('../../db');
var usersModel = require('../../models/users');


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
     *             "recommender_user": "wMvbmOeYAl"
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

        var fields = lodashIntersection(
            Object.keys(req.query),
            usersModel.publicFields
        );
        if (fields.length === 0)
            fields = usersModel.publicFields;

        db.getFromBy(
            fields,
            'users_public',
            {username: req.user.username},
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


module.exports = router;
