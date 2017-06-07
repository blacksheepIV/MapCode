/**
 * Personal points.
 *
 * @module models/personal-points
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */


var db = require('../db');


/**
 * Verification schema.
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
            errorMessage: 'length_not_1_to_30'
        }
    },
    'description': {
        isLength: {
            options: {max: 21844},
            errorMessage: 'length_greater_than_21844'
        }
    }
};


/**
 * @callback personalPointsSubmitCallback
 * @param err
 * @param {number} personalPointId
 */

/**
 * Submits a new point.
 *
 * @param {object} personalPoint
 * @param {personalPointsSubmitCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.submit = function (personalPoint, callback) {
    db.objectInsertQuery(
        'personal_points',
        personalPoint,
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("submit@models/personal-points: MySQL error in inserting new personal point:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Send points's id to callback
            return callback(null, results.insertId);
        }
    );
};


/**
 * Deletes a personal point with given owner and code.
 *
 * @param {string} owner Point's owner.
 * @param {string} code Point's code.
 * @param {function} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.delete = function (owner, code, callback) {
    db.conn.query(
        "DELETE FROM `personal_points` WHERE `owner` = ? AND `id` = ?",
        [owner, code],
        function (err) {
            // MySQL error
            if (err) {
                console.error("delete@models/personal-points: MySQL error in deleting personal point:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            return callback();
        }
    );
};


/**
 * @callback personalPointsGetForUserCallback
 * @param err
 * @param {object[]} userPersonalPoints
 */

/**
 * Gets list of personal points for a user.
 *
 * @param {(number|string)} userId User's ID.
 * @param {(number|string)} start Start from start-th point.
 * @param {(number|string)} limit Number of point's to get.
 * @param {personalPointsGetForUserCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getForUser = function (userId, start, limit, callback) {
    db.conn.query(
        "SELECT `id` as `code`, `lat`, `lng`, `name`, `description` " +
        "FROM `personal_points` " +
        "WHERE owner = ? " +
        "LIMIT ?, ?",
        [userId, start, limit],
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("getForUser@models/personal-points: MySQL error in getting personal points for a user:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            callback(null, results);
        }
    );
};
