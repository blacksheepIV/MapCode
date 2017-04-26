var router = require('express').Router();
var moment = require('moment');
var _array = require('lodash/array');

var jwt = require('../../utils/jwt');
var db = require('../../db');
var usersModel = require('../../models/users');


router.use('/users/',
    jwt.JWTCheck,
    jwt.JWTErrorIgnore
);

router.route('/users/')
    .get(function (req, res) {
        // Check if user is signed-in or not
        if (!req.user) {
            return res.status(401).end();
        }

        var fields = _array.intersection(
            Object.keys(req.query),
            usersModel.publicFields
        );
        if (fields.length === 0)
            fields.push('*');

        db.getFromBy(
            fields,
            'users_public',
            {code: req.user.userCode},
            function (err, results) {
                if (err) {
                    console.error("MySQL: Error in getting token user's info: %s", err);
                    return res.status(500).end();
                }

                if (results.length === 0) {
                    console.error("!!!: Non-existent user have passed the token auth: token: %s", JSON.stringify(req.user));
                    return res.status(404).end();
                }

                if (results[0].date)
                    results[0].date = moment(results[0].date).format('YYYY-MM-DD');

                res.send(results[0]);
            }
        );

    });


module.exports = router;
