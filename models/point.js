var db = require('../db');


module.exports.publicFields = [
    'lat',
    'lng',
    'submission_date',
    'name',
    'phone',
    'province',
    'city',
    'code',
    'address',
    'public',
    'owner',
    'rate',
    'popularity',
    'category',
    'description',
    'tags'
];


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
    'description': {
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
    },
    'category': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max:30},
            errorMessage: 'length_not_1_to_30'
        }
    },
    'tags': {
        isArray: {
            errorMessage: 'not_array'
        },
        strElemMaxLen: {
            options: 40,
            errorMessage: 'tag_greater_than_40'
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
    if (point.tags && Array.isArray(point.tags)) {
        point.tags.map(function (tag) {
            return tag.trim();
        });
        point.tags = point.tags.join(' ');
    }

    db.conn.query(
        "CALL addPoint(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @point_code, @err); SELECT @err AS `err`, @point_code AS `pointCode`;",
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
            point.public,
            point.category,
            point.description,
            point.tags
        ],
        function (err, results) {
            if (err) {
                console.error("MySQL: Error happened in inserting new point: %s", err);
                return callback('serverError');
            }

            var procErr = results[1][0].err,
                pointCode = results[1][0].pointCode;
            // Procedure has returned an error
            if (procErr !== 0) {
                if (procErr === 2) {
                    callback('owner_not_found');
                    console.error("!!!: A non existing user have passed auth and is requesting to submit a point!: user's id: %s", point.owner);
                }
                else if (procErr === 4) {
                    callback('category_not_found');
                }
                else {
                    callback('not_enough_credit_bonus');
                }
            }
            else {
                // Procedure has been successful
                callback(null, pointCode);
            }
        }
    );
};
