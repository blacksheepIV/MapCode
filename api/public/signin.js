var router = require('express').Router();

var usersModel = require('../../models/users');
var jwt = require('../../utils/jwt');


router.route('/signin')
    .post(function (req, res) {
        req.validateBodyWithSchema(usersModel.schema,
            ['username', 'password'],
            function () {
                usersModel.signIn(req.body.username, req.body.password, function (err, userCode) {
                    if (err !== null) {
                        if (err === 'serverError') {
                            res.status(500).end();
                        }
                        else if (err === 'username_or_password_is_wrong') {
                            res.status(404).json({
                                errors: [err]
                            });
                        }
                    }
                    else {
                        jwt.generateToken(
                            userCode,
                            req.query.m !== undefined,
                            function (err, token) {
                                if (err) {
                                    res.status(500).end();
                                }
                                else {
                                    res.json({
                                        token: token
                                    });
                                }
                            }
                        );
                    }
                });
            });
    });


module.exports = router;
