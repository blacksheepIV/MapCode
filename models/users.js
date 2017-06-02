var bcrypt = require('bcryptjs');
var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASHIDS, 10);
var asyncRetry = require('async/retry');
var asyncSeries = require('async/series');
var asyncSetImmediate = require('async/setImmediate');
var moment = require('moment');

var db = require('../db');


module.exports.publicFields = [
    'name',
    'melli_code',
    'email',
    'date',
    'mobile_phone',
    'phone',
    'username',
    'address',
    'description',
    'type',
    'code',
    'credit',
    'bonus',
    'recommender_user'

];


module.exports.updatableFields = [
    'name',
    'melli_code',
    'email',
    'date',
    'mobile_phone',
    'phone',
    'username',
    'password',
    'address',
    'description',
    'sms_code'
];


module.exports.signUpFields = [
    'name',
    'melli_code',
    'email',
    'date',
    'mobile_phone',
    'username',
    'password',
    'recommender_user',
    'type',
    'sms_code'
];


// Fields that non-friends and sign out users can access
module.exports.nonFriendFields = [
    'name',
    'phone',
    'username',
    'description'
];


// Fields that user's friends can access
module.exports.friendFields =
    // All non-friends fields in addition of below fields
    module.exports.nonFriendFields.concat([
        'email'
    ]);


// Verification schema
module.exports.schema = {
    'name': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {max: 40, min: 1},
            errorMessage: 'length_not_1_to_40'
        },
        isPersianString: {
            errorMessage: 'not_persian_name'
        }
    },
    'melli_code': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isInt: {
            errorMessage: 'not_numeric'
        },
        isLength: {
            options: {max: 10, min: 5},
            errorMessage: 'length_5_not_10'
        }
    },
    'email': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isEmail: {
            errorMessage: 'invalid_email'
        },
        isLength: {
            options: {min: 1, max: 100},
            errorMessage: "length_not_1_to_100"
        }
    },
    'date': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isDate: {
            errorMessage: 'not_a_date'
        }
    },
    'phone': {
        isInt: {
            errorMessage: 'not_numeric'
        },
        isLength: {
            options: {max: 11, min: 11},
            errorMessage: 'length_not_11'
        }
    },
    'mobile_phone': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isInt: {
            errorMessage: 'not_numeric'
        },
        isLength: {
            options: {max: 11, min: 11},
            errorMessage: 'length_not_11'
        }
    },
    'username': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isUsername: {
            errorMessage: 'not_valid_username'
        },
        isLength: {
            options: {min: 5, max: 15},
            errorMessage: 'length_not_5_to_15'
        }
    },
    'password': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 6, max: 20},
            errorMessage: 'length_not_6_to_20'
        }
    },
    'address': {
        isLength: {
            options: {max: 21844},
            errorMessage: 'length_greater_than_21844'
        }
    },
    'description': {
        isLength: {
            options: {max: 21844},
            errorMessage: 'length_greater_than_21844'
        }
    },
    'recommender_user': {
        isAlphanumeric: {
            errorMessage: 'not_alpha_numeric'
        },
        isLength: {
            options: {min: 10, max: 10},
            errorMessage: 'length_not_10'
        }
    },
    'type': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isOneOf: {
            options: ['0', '2'],
            errorMessage: 'not_0_or_2'
        }
    },
    'sms_code': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isInt: {
            errorMessage: 'not_numeric'
        },
        isLength: {
            options: {min: 5, max: 5},
            errorMessage: 'length_not_5'
        }
    }
};


/*
     Updates a user in database

     Errors:
        - recommender_user_not_found
        - Array of duplicate rows. e.g. ['duplicate_email']

        - serverError
 */
module.exports.updateUser = function (user, conditions, callback) {
    asyncSeries([
        // Handle `password` field
        function (next) {
            // If `password` doesn't need to get updated
            if (!user.password) {
                return asyncSetImmediate(function () {
                    next();
                });
            }

            bcrypt.hash(user.password, 8, function (err, hashedPassword) {
                // bcryptjs error
                if (err) {
                    console.error("updateUser@models/users: bcryptjs: Error in hasing user's password:\n\t%s", err);
                    return next('serverError');
                }

                user.password = hashedPassword;

                next();
            });
        },
        function (next) {
            if (user.date)
                user.date = moment(user.date).format('YYYY-MM-DD');

            db.runUpdateQuery({table: 'users', fields: user, conditions: conditions}, function (err) {
                // MySQL error
                if (err) {
                    // There are duplicates in user's info
                    if (err.code === 'ER_DUP_ENTRY')
                        return next(db.listOfDuplicates(err));

                    if (err.code === 'ER_NO_REFERENCED_ROW_2')
                        return next('recommender_user_not_found');

                    console.error("updateUser@models/users: MySQL: Error happened in inserting new user:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                    return next('serverError');
                }

                next();
            });
        }
    ], function (err) {
        if (err) return callback(err);

        callback();
    });
};


/*
     Inserts a new user in database

     Errors:
         - no_recommender_user_with_this_code
         - Array of duplicate rows. e.g. ['duplicate_email']

         - serverError
 */
module.exports.createNewUser = function (user, callback) {
    function saveUser() {
        user.type = Number(user.type);
        // Hash the user's password

        bcrypt.hash(user.password, 8, function (err, hashedPassword) {
            if (err) {
                callback('serverError');
                return console.error("createNewUser@models/users: bcryptjs: Error happened in hashing user's password:\n\t%s", err);
            }

            user.password = hashedPassword;
            user.date = moment(user.date).format('YYYY-MM-DD');

            // Insert user into database
            db.objectInsertQuery('users', user, function (err, results) {
                if (err) {
                    // There are duplicates in user's info
                    if (err.code === 'ER_DUP_ENTRY')
                        return callback(db.listOfDuplicates(err));

                    callback('serverError');
                    return console.error("createNewUser@models/users: MySQL: Error happened in inserting new user:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                }

                // Keep trying to generate a unique user code for new user
                asyncRetry({
                    // This error only means task has failed
                    errorFilter: function (err) {
                        return err.code === "ER_DUP_ENTRY";
                    }
                }, function (done) {
                    var uniqueCode = hashids.encode(results.insertId);
                    db.conn.query("UPDATE `users` SET `code` = ? WHERE `id` = ?",
                        [uniqueCode, results.insertId],
                        function (err) {
                            if (err) {
                                console.error("createNewUser@models/users: MySQL: Error happened in updating new user's code:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                                return done(err);
                            }

                            done(null, uniqueCode);
                        }
                    );
                }, function (err, result) {
                    if (err) {
                        console.error("createNewUser@models/users: ! : Tried 5 times to generate a unique user code but failed.");
                        return callback('serverError');
                    }

                    callback(null, result);
                });
            });
        });
    }

    // We should check the recommender_user existence
    if (user.recommender_user !== undefined) {
        db.conn.query("SELECT `id` FROM `users` WHERE `code`= ?;",
            user.recommender_user,
            function (err, results) {
                if (err) {
                    callback('serverError');
                    return console.error("createNewUser@models/users: MySQL: Error happened in checking signup recommender_user existence:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                }

                // There is a user with this code
                if (results.length !== 0) {
                    // Change recommender_user field from code to id
                    user.recommender_user = results[0].id;

                    saveUser();
                }
                // There is no user with this code
                else
                    return callback('no_recommender_user_with_this_code');
            });
    }
    else
        saveUser();
};


/*
     Checks if there is a user with given username and password

     Errors:
         - username_or_password_is_wrong

         - serverError
 */
module.exports.signIn = function (username, password, callback) {
    // Try to retrieve user's info with given username from DB
    db.conn.query("SELECT `password`, `id` from `users` WHERE `username` = ?",
        username,
        function (err, results) {
            if (err) {
                callback('serverError');
                return console.error("signIn@models/users: MySQL: Error in retrieving user's info for sign in:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
            }

            // If no user found with given username
            if (results.length === 0) {
                callback('username_or_password_is_wrong');
            }
            else {
                // Check password
                bcrypt.compare(password, results[0].password, function (err, result) {
                    if (err) {
                        callback('serverError');
                        console.error("signIn@models/users: bcryptjs: Error in comparing password for sign in:\n\t%s", err);
                    }
                    else {
                        // If password does not match
                        if (result === false) {
                            callback('username_or_password_is_wrong');
                        }
                        else {
                            callback(null, results[0].id);
                        }
                    }
                });
            }
        }
    );
};


/*
     Check friendship status of two users base on their usernames.

     Returns:
         0 : Are not friends
         1 : Are friends
         2 : Are friends and first_user has requested
         3 : Are friends has second_user has requested

     Note: If any one given usernames does not exist, 0 will return.

     Errors:
        - serverError
 */
module.exports.friendshipStatus = function (user1, user2, callback) {
    db.conn.query(
        "SELECT `friendshipStatus` (?, ?) as `status`",
        [user1, user2],
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("areFriends@models/users: MySQL error in getting user's friendship from `friends_username` view:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            callback(null, results[0].status);
        }
    );
};


/*
    Get user's info

    Errors:
        - serverError
 */
module.exports.get = function (username, fields, callback) {
    if (fields.length === 0)
        return callback(null, {});

    db.runSelectQuery(
        {
            columns: fields,
            table: 'users',
            conditions: {
                username: username
            }
        },
        function (err, results) {
            if (err) {
                console.error("get@models/users: MySQL: Error in getting user's info:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // User with given username not found
            if (results.length === 0)
                return callback(null, null);

            callback(null, results[0]);
        }
    );
};


/*
 Get user's detailed info

 Errors:
    - serverError
 */
module.exports.getDetailed = function (username, fields, callback) {
    if (fields.length === 0)
        return callback(null, {});

    db.runSelectQuery(
        {
            columns: fields,
            table: 'users_detailed',
            conditions: {
                username: username
            }
        },
        function (err, results) {
            if (err) {
                console.error("getDetailed@models/users: MySQL: Error in getting user's detailed info:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // User with given username not found
            if (results.length === 0)
                return callback(null, null);

            callback(null, results[0]);
        }
    );
};


/*
    Get a user's points

    publicOrPrivate: if 'public' then only public points
                     if 'private' then only private points


    Errors:
        - serverError
 */
module.exports.getPoints = function (username, publicOrPrivate, fields, start, limit, callback) {
    var conditions = {
        owner: username
    };

    if (publicOrPrivate)
        switch (publicOrPrivate) {
            case 'public':
                conditions.public = true;
                break;
            default:
                conditions.public = false;
        }

    db.runSelectQuery({
        table: 'points_detailed',
        columns: fields,
        conditions: conditions,
        start: start,
        limit: limit
    }, function (err, results) {
        // MySQL error
        if (err) {
            console.error("getPoints@models/users: MySQL: Error in getting user's points:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
            return callback('serverError');
        }

        callback(null, results);
    });
};


module.exports.checkFriendshipStatus = function () {
    // A middleware that checks friendship status
    return function (req, res, next) {
        // Is current requester user is friend of `username`
        req.isFriend = false;
        // Is current requester user same as `username`
        req.isMySelf = false;
        // Friendship status between current requester and `username`
        req.friendship = 'no';

        // If user is signed in
        if (req.user) {
            // If the requester and `username` are same
            if (req.params.username === req.user.username) {
                req.isFriend = true;
                req.isMySelf = true;
                req.friendship = 'friend';

                return next();
            }

            // Check if signed in user is a friend of `username`
            module.exports.friendshipStatus(req.params.username, req.user.username, function (err, friendship_status) {
                // Server error
                if (err) return res.status(500).end();

                switch (friendship_status) {
                    case 0: // Are not friends
                        break;
                    case 1: // Are friends
                        req.isFriend = true;
                        req.friendship = 'friend';
                        break;
                    case 2: // username has requested to user
                        req.friendship = 'pending_to_me';
                        break;
                    default: // user has requested to username
                        req.friendship = 'pending_from_me';
                }

                next();
            });
        }
        // If user is a signed out user
        else
            next();
    };
};
