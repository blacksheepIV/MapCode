var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASHIDS, 20);
var asyncRetry = require('async/retry');

var db = require('../db');


// Verification schema
module.exports.schema = {
    'lat': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isDecimal: {
            options: [10, 8],
            errorMessage: 'not_valid_latitude'
        }
    },
    'lng': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isDecimal: {
            options: [11, 8],
            errorMessage: 'not_valid_longitude'
        }
    },
    'name': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 30},
            errorMessagE: 'length_not_1_to_30'
        }
    },
    'phone': {
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
    'province': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 25},
            errorMessage: 'length_not_1_to_25'
        }
    },
    'city': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 25},
            errorMessage: 'length_not_1_to_25'
        }
    },
    'address': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {max: 21844},
            errorMessage: 'length_greater_than_21844'
        }
    },
    'public': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isOneOf: {
            options: ['0', '1'],
            errorMessage: 'not_0_or_1'
        }
    }
};

/*
 Inserts a new point in `points` table

 Errors:
 - serverError
 - owner_not_found
 - not_enough_credit_bonus
 */
module.exports.addPoint = function (point, callback) {
    db.conn.query(
        "CALL addPoint(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @insert_id, @err); SELECT @err AS `err`, @insert_id AS `insertId`;",
        [
            point.owner,
            point.lat,
            point.lng,
            point.submission_date,
            point.expiration_date,
            point.name,
            point.phone,
            point.province,
            point.city,
            point.address,
            point.public
        ],
        function (err, results) {
            var procErr = results[1][0].err,
                resultId = results[1][0].insertId;

            if (err) {
                callback('serverError');
                console.error("MySQL: Error happened in inserting new point: %s", err);
            }
            // Procedure has returned an error
            else if (procErr !== 0) {
                if (procErr === 2) {
                    callback('owner_not_found');
                    console.error("!!!: A non existing user have passed auth and is requesting to submit a point!: user's id: %s", point.owner);
                }
                else {
                    callback('not_enough_credit_bonus');
                }
            }
            // Procedure has been successful
            else {
                // Try 5 times to generate a unique code for new point
                asyncRetry({
                    errorFilter: function (err) {
                        // Check if error has happened because of `code` duplication
                        return err.code === "ER_DUP_ENTRY";
                    }
                }, function (done) {
                    db.conn.query(
                        "UPDATE `points` SET `code` = ? WHERE `id` = ?",
                        [hashids.encode(resultId), resultId],
                        function (err) {
                            if (err) {
                                console.error("MySQL: Error happened in updating new point's code: %s", err);
                                return done(err);
                            }
                            // Unique code generated successfully
                            done();
                        }
                    );
                }, function (err) {
                    if (err) {
                        console.error("!!!: Tried 5 times to generate a unique point code but failed.");
                        return callback('serverError');
                    }

                    callback();
                });
            }
        }
    );
};
