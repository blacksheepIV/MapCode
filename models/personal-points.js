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
    'description': {
        isLength: {
            options: {max: 21844},
            errorMessage: 'length_greater_than_21844'
        }
    }
};


/*
    Submits a new personal points.
 */
module.exports.submit = function (personalPoint, callback) {
    db.objectInsertQuery(
        'personal_points',
        personalPoint,
        function (err, results) {
            if (err) {
                console.error("submit@models/personal-points: MySQL error in inserting new personal points\nQuery: %s\nError: %s", err.sql, err);
                return callback('serverError');
            }

            // Send points's id to callback
            return callback(null, results.insertId);
        }
    );
};
