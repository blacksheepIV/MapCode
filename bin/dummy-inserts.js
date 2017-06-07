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


// Stores inserted users codes
var usersCodes = {};


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
                "category": "فرهنگسرا",
                "description": "یک توضیح الکی!",
                "tags": ["food", "رستوران"]
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
                "category": "کتابخانه",
                "tags": ["فروشگاه", "لباس"]
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
                "category": "شرکت ساختماني",
                "tags": ["سیخ", "رستوران"]
            }
        ],
        "personal_points": [
            {
                "lat": "24.32",
                "lng": "113.32",
                "name": "نقطه شخصی ۱"
            },
            {
                "lat": "26.32",
                "lng": "11.32",
                "name": "نقطه شخصی ۲",
                "description": "توضیحات نقطه‌ي شخصی ۲"
            }
        ]
    },
    {
        "info": {
            "name": "محمد",
            "melli_code": "9876543212",
            "email": "mohammad@gmail.com",
            "date": "1994-02-05",
            "mobile_phone": "09376547366",
            "username": "mohammad",
            "password": "123456",
            "type": "0",
            "recommender_user": "alireza"
        },
        "points": [
            {
                "lat": "10.32",
                "lng": "11.32",
                "name": "لبنیاتی حاج ممد",
                "phone": "03166887654",
                "province": "کهکیلویه و بویر احمد",
                "city": "کاشان!",
                "address": "خیابان ممدیان",
                "public": 0,
                "category": "فرهنگسرا",
                "description": "لبنیاتی هستم!",
                "tags": ["لبنیاتی", "شیر", "پنیر", "ماست"]
            }
        ]
    },
    {
        "info": {
            "name": "وحید",
            "melli_code": "1236543456",
            "email": "vahid@gmail.com",
            "date": "1997-02-05",
            "mobile_phone": "09126547388",
            "username": "vahid",
            "password": "123456",
            "type": "0",
            "recommender_user": "mohammad"
        }
    },
    {
        "info": {
            "name": "حمید",
            "melli_code": "8796548251",
            "email": "hamid@gmail.com",
            "date": "1996-02-05",
            "mobile_phone": "09368749566",
            "username": "hamid",
            "password": "123456",
            "type": "0",
            "recommender_user": "vahid",
            "credit": 50,
            "bonus": 10
        }
    }
];


var dummyFriends = [
    ['hamid', 'mohammad'],
    ['vahid', 'mohammad'],
    ['vahid', 'alireza'],
    ['mohammad', 'alireza'],
    ['alireza', 'hamid']
];


var dummyFriendRequests = [
    ['vahid', 'hamid']
];


async.series([
    // Insert dummy users
    function (neext) {
        async.eachSeries(
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
                                    console.error(errMsg + 'Falling through...\n');
                                    return next(null, null);
                                } else
                                    return next(errMsg);
                            }

                            if (!body.sms_code) {
                                redis.get(smsModel.phoneNumberKey(user.info.mobile_phone), function (err, reply) {
                                    if (err) {
                                        if (fallThrough) {
                                            console.error("Redis erro: %s\nFalling through...\n", err);
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

                        if (user.info.recommender_user) {
                            user.info.recommender_user = usersCodes[user.info.recommender_user];
                        }

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

                            usersCodes[user.info.username] = res.body.code;

                            next(null, 201);
                        });
                    },
                    function (statusCode, next) {
                        if (!(statusCode === 201 || updateExisting))
                            return async.setImmediate(next);

                        db.conn.query(
                            "UPDATE `users` SET `credit` = ?, `bonus` = ? WHERE `username` = ?",
                            [
                                user.info.credit || 100,
                                user.info.bonus || 50,
                                user.info.username
                            ],
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
                                    url: process.env.API_HREF + 'points/',
                                    headers: {
                                        "Authorization": "Bearer " + token
                                    },
                                    json: point
                                }, function (err, res) {
                                    if (err) return point_done(err);

                                    if (res.statusCode !== 201) {
                                        var errMsg = "points/ statusCode = " + res.statusCode +
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

                                next(null, token);
                            }
                        );
                    },
                    // Submit user's personal points
                    function (token, next) {
                        async.forEach(
                            user.personal_points,
                            function (personalPoint, personalPointDone) {
                                request.post({
                                        url: process.env.API_HREF + 'personal_points/',
                                        headers: {
                                            "Authorization": "Bearer " + token
                                        },
                                        json: personalPoint
                                    },
                                    function (err, res) {
                                        if (err) return personalPointDone(err);

                                        if (res.statusCode !== 201) {
                                            var errMsg = "personal_points/ statusCode = " + res.statusCode +
                                                "' for personal point'" + personalPoint.name +
                                                "' response =\n\t" + JSON.stringify(res.body) + '\n';
                                            if (fallThrough) {
                                                console.log(errMsg + "Falling through...\n");
                                                return personalPointDone();
                                            } else
                                                return personalPointDone(errMsg);
                                        }

                                        personalPointDone();
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
                    console.error("Failed to insert dummy users: %s", err);
                    neext(true);
                }
                else
                    neext();
            }
        );
    },
    // Insert dummy friends and dummy friend requests
    function (neext) {
        async.parallel([
            function (dummyFriendsDone) {
                // Insert friends
                async.forEach(dummyFriends, function (dummyFriend, nextFriend) {
                    db.conn.query(
                        "START TRANSACTION; " +
                        "SELECT id INTO @first_id FROM users WHERE username = ? LOCK IN SHARE MODE; " +
                        "SELECT id INTO @second_id FROM users WHERE username = ? LOCK IN SHARE MODe; " +
                        "INSERT " + (fallThrough ? 'IGNORE ' : '') + "INTO friends VALUES (@first_id, @second_id); " +
                        "COMMIT;",
                        [dummyFriend[0], dummyFriend[1]],
                        function (err) {
                            if (err) {
                                if (fallThrough)
                                    return nextFriend();

                                return nextFriend(err);
                            }

                            nextFriend();
                        }
                    );
                }, function (err) {
                    if (err) {
                        if (fallThrough)
                            return dummyFriendsDone();
                        else
                            return dummyFriendsDone(err);
                    }

                    dummyFriendsDone();
                });
            },
            function (dummyFriendRequestsDone) {
                // Insert dummy friend requests
                async.forEach(dummyFriendRequests, function (dummyFriendRequest, nextFriendRequest) {
                    db.conn.query(
                        "START TRANSACTION; " +
                        "SELECT id INTO @first_id FROM users WHERE username = ? LOCK IN SHARE MODE; " +
                        "SELECT id INTO @second_id FROM users WHERE username = ? LOCK IN SHARE MODe; " +
                        "INSERT " + (fallThrough ? 'IGNORE ' : '') + "INTO friend_requests VALUES (@first_id, @second_id, @first_id); " +
                        "COMMIT;",
                        [dummyFriendRequest[0], dummyFriendRequest[1]],
                        function (err) {
                            if (err) {
                                if (fallThrough)
                                    return nextFriendRequest();

                                return nextFriendRequest(err);
                            }

                            nextFriendRequest();
                        }
                    );
                }, function (err) {
                    if (err) {
                        if (fallThrough)
                            return dummyFriendRequestsDone();
                        else
                            return dummyFriendRequestsDone(err);
                    }

                    dummyFriendRequestsDone();
                });
            }
        ], function (err) {
            if (err) {
                console.error("Failed to insert dummy friends and dummy friend requests: %s", err);
                neext(err);
            }
            else
                neext();
        });
    }
], function (err) {
    if (err)
        return process.exit(1);

    process.exit(0);
});
