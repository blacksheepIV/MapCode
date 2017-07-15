/**
 * Points.
 *
 * @module models/points
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */

var util = require('util');
var lodashIncludes = require('lodash/includes');
var lodashOmit = require('lodash/omit');

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
 * Point's fields that are available by it's owner.
 *
 * @constant
 * @type {string[]}
 * @see module:modules/points.publicFields
 */
var ownerFields = module.exports.ownerFields = [
    'submission_date',
    'expiration_date'
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
 * @throws {'not_enough_credit'}
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

                    if (lodashIncludes(err.message, 'NOT_ENOUGH_CREDIT'))
                        return callback('not_enough_credit');

                    if (lodashIncludes(err.message, 'CATEGORY_NOT_FOUND'))
                        return callback('category_not_found');
                }
                console.error("add@models/points: MySQL: Error happened in inserting new point:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Procedure has been successful
            callback(null, results[1][0].pointCode);
        }
    );
};


/**
 * This strings will get included inside getDetailed function
 * if user is singed in.
 *
 * @type {string}
 */
var getDetailedPrivateQuery =
    " OR `T`.`owner` = ?" +
    " OR EXISTS(SELECT *" +
    "      FROM `friends`" +
    "      WHERE" +
    "        (`friends`.`first_user` = ? AND `friends`.`second_user` = `T`.`owner_id`)" +
    "        OR" +
    "        (`friends`.`second_user` = ? AND `friends`.`first_user` = `T`.`owner_id`)" +
    "    )";
/**
 * getDetailed function's main query.
 *
 * This query includes two '%s'.
 * First one must get replaced with arbitrary fields.
 * Second one must get replaced with Either an empty string or
 * more conditional SQL string.
 *
 * @type {string}
 */
var getDetailedQuery =
    " SELECT %s" +
    " FROM `points_detailed` AS `T`" +
    " WHERE `T`.`code` = ? AND" +
    " (" +
    "   `T`.public = TRUE %s" +
    " ) AND (DATEDIFF(`T`.`expiration_date`, CURDATE()) >= -3 OR `T`.`owner_id` = ?)";
/**
 * @callback pointsGetDetailedWithRequesterUserCallback
 * @param err
 * @param {object} pointDetailedInfo
 */
/**
 * Gets detailed info for a point with given requester user.
 * If user is not set, only public points will be available
 * But if it's available his/her private points and his/her
 * friends private points will also be available.
 *
 * Except requester's points, all other points that are expired
 * won't be returned.
 *
 * @param {object} requesterUser The user who wants to access a point's detailed info.
 * @param {string} requesterUser.username
 * @param {(number|string)} requesterUser.id
 * @param {string} pointCode Point's code.
 * @param {string[]} fields List of fields to retrieve. Must be subset of {@link module:models/points.publicFields}. If requesterUser is point's owner fields also can include {@link module:models/points.ownerFields}.
 * @param {pointsGetDetailedWithRequesterUserCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getDetailedWithRequesterUser = function (requesterUser, pointCode, fields, callback) {
    db.conn.query(
        util.format(
            getDetailedQuery,
            // Always add 'owner_id` to check for owner fields
            fields.concat('owner_id').map(db.conn.escapeId).join(','),
            // Checks if user is given it will include private query in main query
            (requesterUser ? getDetailedPrivateQuery : '')
        ),
        [pointCode]
        // Checks if user is given it will add necessary query values
            .concat(requesterUser ? [requesterUser.username, requesterUser.id, requesterUser.id] : [])
            // Add requester's id or insert null for expiration checking
            .concat(requesterUser ? requesterUser.id : null),
        function (err, results) {
            if (err) {
                console.error("get@models/points: MySQL: Error happened getting detailed point:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Point not found
            if (results.length === 0)
                return callback();

            var result = results[0];

            // If user is not signed-in or is not point's owner then remove owner fields
            if (!requesterUser || requesterUser.id !== result.owner_id)
                result = lodashOmit(result, ownerFields);

            delete result.owner_id;

            callback(null, result);
        }
    );
};
