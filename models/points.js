/**
 * Points.
 *
 * @module models/points
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */

var lodashIncludes = require('lodash/includes');

var db = require('../db');


/**
 * Point's fields that are available.
 *
 * @constant
 * @type {string[]}
 */
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


/**
 * Point verification schema.
 *
 * @constant
 * @type {object}
 */
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


/**
 * @callback pointsAdd
 * @param err
 * @param {string} pointCode Newly created point's code.
 */

/**
 * Adds a new point for a user.
 *
 * @param {object} point Point's info.
 * @param {pointsAdd} [callback]
 *
 * @throws {'serverError'}
 * @throws {'owner_not_found'}
 * @throws {'not_enough_credit_bonus'}
 */
module.exports.add = function (point, callback) {
    if (point.tags && Array.isArray(point.tags)) {
        point.tags.map(function (tag) {
            return tag.trim();
        });
        point.tags = point.tags.join(' ');
    }

    db.conn.query(
        "CALL addPoint(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @point_code); SELECT @point_code AS `pointCode`;",
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
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, 'OWNER_NOT_FOUND'))
                        return callback('owner_not_found');

                    if (lodashIncludes(err.message, 'NOT_ENOUGH_CREDIT_BONUS'))
                        return callback('not_enough_credit_bonus');

                    if (lodashIncludes(err.message, 'CATEGORY_NOT_FOUND'))
                        return callback('category_not_found');
                }
                console.error("MySQL: Error happened in inserting new point:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Procedure has been successful
            callback(null, results[1][0].pointCode);
        }
    );
};
