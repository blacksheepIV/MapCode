/**
 * Users.
 *
 * @module models/users
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */

var util = require('util');
var bcrypt = require('bcryptjs');
var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASHIDS, 10);
var asyncRetry = require('async/retry');
var asyncSeries = require('async/series');
var asyncSetImmediate = require('async/setImmediate');
var moment = require('moment');
var lodashIntersection = require('lodash/intersection');
var lodashTrim = require('lodash/trim');
var glob = require('glob');
var path = require('path');

var db = require('../db');
var jwt = require('../utils/jwt');


/**
 * User's fields that are available.
 *
 * @constant
 * @type {string[]}
 */
var publicFields = module.exports.publicFields = [
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


/**
 * Allowed user document mime-types
 *
 * @constant
 * @type {object}
 */
module.exports.documentMimeTypes = {
    'application/x-rar-compressed': 'rar',
    'application/x-compressed': 'zip',
    'application/x-zip-compressed': 'zip',
    'application/zip': 'zip',
    'multipart/x-zip': 'zip'
};


/**
 * Get user's new type when uploading new document.
 *
 * @constant
 * @type {number[]}
 */
module.exports.documentUploadNewType = [
    4, // When type = 0
    6, // When type = 1
    5, // When type = 2
    7  // When type = 3
];


/**
 * User's detailed fields that are available.
 * This includes publicFields.
 *
 * @constant
 * @type {string[]}
 * @see module:models/users.publicFields
 */
module.exports.detailedPublicFields = publicFields.concat(
    ['friend_requests_count',
        'friends_count',
        'points_count',
        'personal_points_count',
        'sent_messages_count',
        'received_messages_count',
        'unread_messages_count'
    ]);


/**
 * Point's fields that can get updated.
 *
 * @constant
 * @type {string[]}
 */
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


/**
 * Fields that are available through sign up.
 *
 * @constant
 * @type {string[]}
 */
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


/**
 * Fields that non-friends and sign ou users can access.
 *
 * @constant
 * @type {string[]}
 */
var nonFriendFields = module.exports.nonFriendFields = [
    'name',
    'phone',
    'username',
    'description'
];


/**
 * Fields that user's friends can access.
 * This includes nonFriendFields.
 *
 * @constant
 * @type {string[]}
 * @see module:models/users.nonFriendFields
 */
var friendFields = module.exports.friendFields =
    // All non-friends fields in addition of below fields
    module.exports.nonFriendFields.concat([
        'email'
    ]);


/**
 * User verification schema.
 *
 * @constant
 * @type {object}
 */
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


/**
 * Updates a user info.
 *
 * @param {object} user New user's info.
 * @param {(number|string)} userId User's ID.
 * @param {function} [callback]
 *
 * @throws {'recommender_user_not_found'}
 *
 * @throws {'duplicate_melli_code'}
 * @throws {'duplicate_email'}
 * @throws {'duplicate_mobile_phone'}
 * @throws {'duplicate_phone'}
 * @throws {'duplicate_username'}
 *
 * @throws {'serverError'}
 */
module.exports.updateUser = function (user, userId, callback) {
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

            db.runUpdateQuery({table: 'users', fields: user, conditions: {id: userId}}, function (err) {
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

                // User successfully updated
                next();
            });
        }
    ], function (err) {
        if (err) return callback(err);

        // User successfully updated
        callback();
    });
};



/**
 * @callback usersCreateNewUserCallback
 * @param err
 * @param {string} userCode Newly created user's generated code.
 */

/**
 * Creates a new user.
 *
 * @param {object} user New user's info.
 * @param {usersCreateNewUserCallback} [callback]
 *
 * @throws {'no_recommender_user_with_this_code'}
 *
 * @throws {'duplicate_melli_code'}
 * @throws {'duplicate_email'}
 * @throws {'duplicate_mobile_phone'}
 * @throws {'duplicate_phone'}
 * @throws {'duplicate_username'}
 *
 * @throws {'serverError'}
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
                            // MySQL error
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

                    // Hooray! New user successfully created.
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
                // MySQL error
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


/**
 * @callback usersSignInCallback
 * @param err
 * @param {number} userId
 */

/**
 * Checks if there is a new user with given username and password.
 *
 * @param {string} username
 * @param {string} password
 * @param {usersSignInCallback} [callback]
 *
 * @throws {'username_or_password_is_wrong'}
 *
 * @throws {'serverError'}
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


/**
 * @callback usersFriendshipStatusCallback
 * @param err
 * @param {number} status
 */

/**
 * Checks friendship status of two users.
 * Status can have one of these values:
 *     0 : Are not friends
 *     1 : Are friends
 *     2 : Are friends and first_user has requested
 *     3 : Are friends has second_user has requested
 *     4 : Are same!
 *
 * @param {string} first_user_username First user's username.
 * @param {number|string} second_user_id Second user's id.
 * @param {usersFriendshipStatusCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.friendshipStatus = function (first_user_username, second_user_id, callback) {
    db.conn.query(
        "SELECT `friendshipStatus` (?, ?) as `status`",
        [first_user_username, second_user_id],
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("friendshipStatus@models/users: MySQL:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            callback(null, results[0].status);
        }
    );
};


/**
 * @callback usersGetCallback
 * @param err
 * @param {object} userInfo
 */

/**
 * Gets a user's info.
 *
 * @param {object} conditions
 * @param {string[]} fields List of fields to retrieve.
 * @param {usersGetCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.get = function (conditions, fields, callback) {
    if (fields.length === 0)
        return callback(null, {});

    db.runSelectQuery(
        {
            columns: fields,
            table: 'users',
            conditions: conditions
        },
        function (err, results) {
            if (err) {
                console.error("get@models/users: MySQL: Error in getting user's info:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // User with given conditions not found
            if (results.length === 0)
                return callback(null, null);

            callback(null, results[0]);
        }
    );
};


/**
 * @callback getDetailedCallback
 * @param err
 * @param {object} userDetailedInfo
 */

/**
 * Gets a user's detailed info.
 *
 * @param {object} conditions
 * @param {string[]} fields List of fields to retrieve.
 * @param {getDetailedCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getDetailed = function (conditions, fields, callback) {
    if (fields.length === 0)
        return callback(null, {});

    db.runSelectQuery(
        {
            columns: fields,
            table: 'users_detailed',
            conditions: conditions
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


/**
 * @callback usersGetPointsCallback
 * @param err
 * @param {object[]} userPoints
 */

/**
 * Gets a user's points.
 *
 * @param {string} username User's username.
 * @param {string} publicOrPrivate Get only public or private points or both. Can be 'public', 'private' and null.
 * @param {string[]} fields List of fields to retrieve.
 * @param {(number|string)} start
 * @param {(number|string)} limit
 * @param {usersGetPointsCallback} [callback]
 *
 * @throws {'serverError'}
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
        limit: limit,
        customConditions: "AND DATEDIFF(`expiration_date`, CURDATE()) >= -3"
    }, function (err, results) {
        // MySQL error
        if (err) {
            console.error("getPoints@models/users: MySQL: Error in getting user's points:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
            return callback('serverError');
        }

        callback(null, results);
    });
};


/**
 * A express middleware that checks the friendship status of
 * token user with a username that is req.params.username
 * and sets these variables:
 *     - req.isFriend Shows if two users are friends
 *     - req.isMySelf Shows if two users are the same
 *     - req.friendship Shows friendship status of two users
 *
 * @returns {Function} A express middleware
 */
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
            // Check if signed in user is a friend of `username`
            module.exports.friendshipStatus(req.params.username, req.user.id, function (err, friendship_status) {
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
                    case 3: // user has requested to username
                        req.friendship = 'pending_from_me';
                        break;
                    default:
                        // Are same
                        req.isFriend = true;
                        req.isMySelf = true;
                        req.friendship = 'friend';
                }

                next();
            });
        }
        // If user is a signed out user
        else
            next();
    };
};


/**
 * Sets req.queryFields and req.friendshipStatus based on.
 */
module.exports.friendshipCustomFielder = function (req, res, next) {
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
                friendFields
            );
        else
            req.queryFields = lodashIntersection(
                req.query.fields,
                nonFriendFields
            );

    }

    // If field query string is not present or fields is empty after intersection
    if (!req.query.fields || !req.queryFields.length){
        // If friendship field was not in requested fields
        if (!req.friendshipRequested) {
            if (req.isFriend)
                req.queryFields = friendFields;
            else
                req.queryFields = nonFriendFields;

            if (req.user)
                req.friendshipRequested = true;
        }
    }

    next();
};

/**
 * @callback usersSearchCallback
 * @param err
 * @param {object[]} foundUsers
 */

/**
 * Searches through users by their username or phone number or both.
 *
 * @param {string} [username]
 * @param {string} [phone]
 * @param {(string[]|string)} [fields] Must be '*' or a subset array of {@link module:models/users.nonFriendFields}.
 * @param {(number|string)} [start]
 * @param {(number|string)} [limit]
 * @param {usersSearchCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.search = function (username, phone, fields, start, limit, callback) {
    var query = "SELECT %s FROM `users` %s %s";

    var conditions = [];

    function addCond(str, val) {
        if (val)
            conditions.push(util.format(str, db.conn.escape('%' + val + '%')));
    }

    addCond("`users`.`username` LIKE %s", username);
    addCond("`users`.`phone` LIKE %s", phone);

    // If there is any condition
    if (conditions.length)
        conditions = 'WHERE ' + conditions.join(' AND ');

    // If fields is an array and not '*'
    if (Array.isArray(fields))
        fields = fields.map(db.conn.escapeId).join(',');

    var startLimit = '';
    // If start and limit has given
    if (start) {
        startLimit = 'LIMIT ' + db.conn.escape(start);
        if (limit)
            startLimit += ', ' + db.conn.escape(limit);
    }

    db.conn.query(
        util.format(
            query,
            fields,
            conditions,
            startLimit
        ),
        function (err, results) {
            // MySQL error
            if (err) {
                console.error('search@models/users: MySQL error happened in search users:\n\t\t%s\n\tQuery:\n\t\t%s', err, err.sql);
                return callback('serverError');
            }

            callback(null, results);
        }
    );
};


/**
 * @callback userGetLatestDocument
 * @param err
 * @param {string} path User's latest document path, is undefined if there is none.
 */

/**
 * Returns the path of user's latest uploaded document.
 *
 * @param {number} id  User's id
 * @param {userGetLatestDocument} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getLatestDocument = function (id, callback) {
    glob(
        path.join(__dirname, '../public/docs/', '' + id + '-*'),
        {},
        function (err, files) {
            if (err) {
                console.error("getLatestDocument@models/users: 'glob':\n\t\t%s", err);
                return callback('serverError');
            }

            files = files.sort(function(a, b) {
                a = parseInt(a.slice(a.indexOf('-') + 1, a.lastIndexOf('.')));
                b = parseInt(b.slice(b.indexOf('-') + 1, b.lastIndexOf('.')));
                return a - b;
            });

            callback(null, files.slice(-1)[0]);
        }
    );
};


/**
 * A express middleware that expands req.user with req.user.id user's information.
 *
 * If error happened
 *   and options.tolerateError is true goes on and calls next().
 *   and options.tolerateError is false and options.onError is not set
 *     sends 500 Server Error with empty response.
 *   and options.tolerateError is false and options.onError is set
 *     and is a function, calls options.onError.
 *
 * If req.user is undefined
 *   and options.tolerateNoToken is true goes on and calls next().
 *   and options.tolerateNoToken is false and options.onNoToken is not set
 *     sends 401 Unauthorized with empty response.
 *   and options.tolerateNoToken is false and options.onNoToken is set
 *     and is a function, calls options.onNoToken.
 *
 * If no DB user found
 *   and options.tolerateNotFound is true goes on and calls next().
 *   and options.tolerateNotFound is false and options.onNotFound is not set
 *     sends 401 Unauthorized with empty response and deletes token
 *     from Redis.
 *   and options.tolerateNotFound is false and options.onNotFound is set
 *     and is a function, calls options.onNotFound.
 *
 * @param {object} [options]
 * @param {string|'*'|string[]} [options.fields]
 * @param {boolean} [options.tolerateError] If true, tolerates errors.
 * @param {function} [options.onError]
 * @param {boolean} [options.tolerateNotFound] If true, tolerates not found.
 * @param {function} [options.onNotFound]
 * @param {boolean} [options.tolerateNoToken] If true, tolerates if req.user is undefined.
 * @param {function} [options.onNoToken]
 *
 * @returns {function} A express middleware
 */
module.exports.getMiddleware = function (options) {
    return function (req, res, next) {
        // No valid token has sent
        if (!req.user) {
            if (options.tolerateNoToken === true)
                return next();
            else {
                if (typeof options.onNoToken === 'function')
                    return options.onNoToken();
                else {
                    return res.status(401).json({
                        errors: ["auth_failure"]
                    });
                }
            }
        }

        module.exports.get({id: req.user.id}, options.fields, function (err, user) {
            if (err) {
                if (options.tolerateError === true) {
                    return next();
                }
                else {
                    if (typeof options.onError === 'function')
                        return options.onError();
                    else
                        return res.status(500).end();
                }
            }


            if (!user) {
                if (options.tolerateNotFound === true)
                    return next();
                else {
                    if (typeof options.onNotFound === 'function')
                        return options.onNotFound();
                    else {
                        res.status(401).json({
                            errors: ["auth_failure"]
                        });

                        return jwt.removeFromRedis(req.user.id);
                    }
                }
            }

            Object.keys(user).forEach(function (column) {
                req.user[column] = user[column];
            });

            next();
        });
    };
};
