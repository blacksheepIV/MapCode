#!/usr/bin/env node

var request = require('request');
var path = require('path');
var async = require('async');

require('dotenv').config({path: path.join(__dirname, '../.env')});

var redis = require('../utils/redis');
var db = require('../db');
var smsModel = require('../models/sms');



var fallThrough = false;
if (process.argv.includes('--fall-through'))
    fallThrough = true;

var updateExisting = false;
if (process.argv.includes('--update-existing'))
    updateExisting = true;


var dummyUsers = [
    {
        "info": {
            "name": "علیرضا",
            "melli_code": "1234567654",
            "email": "a.alireza@gmail.com",
            "date": "1996-02-05",
            "mobile_phone": "09368765417",
            "username": "alireza",
            "password": "123456",
            "type": "0",
            "__OPTIONAL__recommender_user": "1234567890"
        },
        "points": [
            {
                "lat": "21.32",
                "lng": "323.32",
                "name": "پیتزا آرشین",
                "phone": "03155447658",
                "province": "اصفهان",
                "city": "کاشان",
                "address": "خیابان امیرکبیر",
                "public": 1,
                "category": "رستوران ایتالیایی",
                "description": "یک توضیح الکی!"
            },
            {
                "lat": "32.32",
                "lng": "13.32",
                "name": "فروشگاه آروین",
                "phone": "03155248651",
                "province": "یزد",
                "city": "یزد",
                /* jshint -W100 */
                "address": "خیابان کریم‌خان",
                "public": 1,
                "category": "فروشگاه لباس"
            },
            {
                "lat": "24.32",
                "lng": "113.32",
                "name": "قصابی اصغرآفا و پسران",
                "phone": "03266118769",
                "province": "کرمان",
                "city": "کرمان",
                "address": "خیابان قسطنطنیه",
                "public": 0,
                "category": "کبابی"
            }
        ]
    }
];


async.forEach(
    dummyUsers,
    function (user, done) {
        async.waterfall([
            // Send SMS request
            function (next) {
                request.post({
                    url: process.env.API_HREF + 'sms/',
                    json: {
                        mobile_phone: user.info.mobile_phone
                    }
                }, function (err, res, body) {
                    if (err)
                        return next(err);

                    if (res.statusCode !== 200) {
                        var errMsg = "sms/ statusCode = '" + res.statusCode +
                            "' for user '" + user.info.username +
                            "' response =\n\t" + JSON.stringify(res.body) + '\n';
                        if (fallThrough) {
                            console.log(errMsg + 'Falling through...\n');
                            return next(null, null);
                        } else
                            return next(errMsg);
                    }

                    if (!body.sms_code) {
                        redis.get(smsModel.phoneNumberKey(user.info.mobile_phone), function (err, reply) {
                            if (err) {
                                if (fallThrough) {
                                    console.log("Redis erro: %s\nFalling through...\n", err);
                                    return next(null, null);
                                } else
                                    return next(err);
                            }

                            next(null, reply);
                        });
                    }
                    else {
                        next(null, body.sms_code);
                    }
                });
            },
            // Create the user
            function (sms_code, next) {
                user.info.sms_code = sms_code;
                request.post({
                    url: process.env.API_HREF + 'signup/',
                    json: user.info
                }, function (err, res) {
                    redis.del(smsModel.phoneNumberKey(user.info.mobile_phone));

                    if (err) return next(err);

                    if (res.statusCode !== 201) {
                        var errMsg = 'signup/ statusCode = ' + res.statusCode +
                                    "' for user '" + user.info.username +
                                    "' response =\n\t" + JSON.stringify(res.body) + '\n';
                        if (fallThrough) {
                            console.log(errMsg + 'Falling through...\n');
                            return next(null, res.statusCode);
                        } else
                            return next(errMsg);
                    }

                   next(null, 200);
                });
            },
            function (statusCode, next) {
                if (!(statusCode === 200 || updateExisting))
                    return async.setImmediate(next);

                db.conn.query(
                    "UPDATE `users` SET `credit` = 100 WHERE `username` = ?",
                    user.info.username,
                    function (err) {
                        if (err) {
                            var errMsg = "Error in updating the credit of user with username = " + user.info.username +
                                         "err =\n\t" + err + '\n';
                            if (fallThrough) {
                                console.log(errMsg + "\nFalling through...\n");
                                next();
                            } else
                                return next(err);
                        }

                        next();
                    }
                );
            },
            // Sign-in the user
            function (next) {
                request.post({
                    url: process.env.API_HREF + 'signin/',
                    json: {
                        username: user.info.username,
                        password: user.info.password
                    }
                }, function (err, res, body) {
                    if (err) return next(err);

                    if (res.statusCode !== 200)
                        return next("signin/ statusCode = " + res.statusCode +
                                    "' for user '" + user.info.username +
                                    "' response =\n\t" + JSON.stringify(res.body) + '\n');

                    next(null, body.token);
                });
            },
            // Submit the user's points
            function (token, next) {
                async.forEach(
                    user.points,
                    function (point, point_done) {
                        request.post({
                            url: process.env.API_HREF + 'point/',
                            headers: {
                                "Authorization": "Bearer " + token
                            },
                            json: point
                        }, function (err, res, body) {
                            if (err) return point_done(err);

                            if (res.statusCode !== 201) {
                                var errMsg = "point/ statusCode = " + res.statusCode +
                                    "' for point'" + point.name +
                                    "' response =\n\t" + JSON.stringify(res.body) + '\n';
                                if (fallThrough) {
                                    console.log(errMsg + "Falling through...\n");
                                    return point_done();
                                } else
                                    return point_done(errMsg);
                            }

                            point_done();
                        });
                    },
                    function (err) {
                        if (err)
                            return next(err);

                        next();
                    }
                );
            }
        ], function (err) {
            if (err)
                return done(err);

            done();
        });
    },
    function (err) {
        if (err) {
            console.error("Failed to insert dummy users and their points: %s", err);
            process.exit(1);
        }
        else {
            console.log("Done.");
            process.exit(0);
        }
    }
);
