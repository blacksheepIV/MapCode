var Hashids = require('hashids');
var hashids = new Hashids(process.env.HASHIDS, 20);

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
 */
module.exports.addPoint = function (point, callback) {
    db.objectInsertQuery('points', point, function (err, results) {
        if (err) {
            callback('serverError');
            console.error("MySQL: Error happened in inserting new point: %s", err);
        }
        else {
            // TODO: Generate a unique code for new point
            db.conn.query(
                "UPDATE `points` SET `code` = ? WHERE `id` = ?",
                [hashids.encode(results.insertId), results.insertId],
                function (err) {
                    if (err) {
                        callback('serverError');
                        console.error("MySQL: Error happened in updating new point's code: %s", err);
                    }
                    else {
                        callback(null, results.insertId);
                    }
                }
            );
        }
    });
};
