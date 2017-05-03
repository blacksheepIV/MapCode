var router = require('express').Router();
var asyncSeries = require('async/series');
var asyncSetImmediate = require('async/setImmediate');

var usersModel = require('../../models/users');
var redis = require('../../utils/redis');
var smsModel = require('../../models/sms');


router.route('/users/')
    .put(function (req, res) {
        req.validateBodyWithSchema(usersModel.schema, usersModel.updatableFields, function () {


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
                        {id: req.user.userId},
                        function (err) {
                            if (err) {
                                if (err === 'serverError')
                                    return next(err);

                                // Duplicate entries error
                                return next(err);
                            }

                            res.status(200).end();
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


        }, 'all');
    });


module.exports = router;
