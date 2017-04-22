var bcrypt = require('bcryptjs');
var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASHIDS, 10);

var db = require('../db');


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
            options: {max: 10, min: 10},
            errorMessage: 'length_not_10'
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
 Inserts a new user in database

 Errors:
    - serverError
    - no_recommender_user_with_this_code
    - Array of duplicate rows. e.g. ['duplicate_email']
  */
module.exports.createNewUser = function (user, callback) {
    function saveUser() {
        user.type = Number(user.type);
        // Hash the user's password

        bcrypt.hash(user.password, 8, function (err, hashedPassword) {
            if (err) {
                callback('serverError');
                console.error("bcryptjs: Error happened in hashing user's password: %s", err);
                return;
            }

            user.password = hashedPassword;

            // Insert user into database
            db.objectInsertQuery('users', user, function (err, results, fields) {
                if (err) {
                    // There are duplicates in user's info
                    if (err.code === 'ER_DUP_ENTRY') {
                        callback(db.listOfDuplicates(err));
                        return;
                    }

                    callback('serverError');
                    console.error("MySQL: Error happened in inserting new user: %s", err);
                    return;
                }

                db.conn.query("UPDATE `users` SET `code` = ? WHERE `id` = ?",
                    [hashids.encode(results.insertId), results.insertId],
                    function (err) {
                        if (err) {
                            callback('serverError');
                            console.error("MySQL: Error happened in updating new user's code: %s", err);
                            return;
                        }

                        callback(null);
                    }
                );
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
                    console.error("MySQL: Error happened in checking signup recommender_user existence: %s", err);
                    return;
                }

                // There is a user with this code
                if (results.length !== 0) {
                    // Change recommender_user field from code to id
                    user.recommender_user = results[0].id;

                    saveUser();
                }
                // There is no user with this code
                else {
                    callback('no_recommender_user_with_this_code');
                    return;
                }
            });
    }
    else
        saveUser();
};


/*
 Checks if there is a user with given username and password

 Errors:
    - serverError
    - username_or_password_is_wrong
 */
module.exports.signIn = function (username, password, callback) {
    // Try to retrieve user's info with given username from DB
    db.conn.query("SELECT `password`, `id` from `users` WHERE `username` = ?",
        username,
        function (err, results) {
            if (err) {
                callback('serverError');
                console.error("MySQL: Error in retrieving user's info for signin: %s", err);
                return;
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
                        console.error("bcryptjs: Error in comparing password in signin: %s", err);
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
